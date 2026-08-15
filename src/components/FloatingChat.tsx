"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, ShoppingCart } from "lucide-react";

function parseMessage(content: string) {
  try {
    // 1. Coba cari blok JSON dengan markdown (```json ... ```)
    const mdMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (mdMatch) {
      const parsed = JSON.parse(mdMatch[1]);
      return { ...parsed, rawText: content.replace(mdMatch[0], '').trim() };
    }

    // 2. Kalau tidak ada markdown, cari kurung kurawal pertama dan terakhir
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace && content.includes('"type"')) {
      const jsonStr = content.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      return { ...parsed, rawText: content.replace(jsonStr, '').trim() };
    }
    
    return { type: "text", text: content };
  } catch (e) {
    return { type: "text", text: content };
  }
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Ada yang bisa kami bantu? (Tulis pesan Anda di bawah)",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Membuat KTP Rahasia (Session ID) unik untuk setiap pengunjung
    setSessionId(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // 1. Masukkan pesan user ke UI
    const newUserMessage = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 2. Mengirim data ke Jembatan API lokal kita (Bypass CORS)
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: newUserMessage.content, sessionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghubungi server AI");
      }

      const data = await response.json();
      
      // Jika n8n membalas dengan struktur JSON { reply: "..." } atau teks biasa
      let aiReply = "Pesan diterima, namun format balasan tidak dikenali.";
      if (typeof data === "string") {
        aiReply = data;
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        aiReply = data.choices[0].message.content; // Format HTTP Request OpenAI/Groq asli
      } else if (data.message && data.message.content) {
        aiReply = data.message.content; // Format Node standar OpenAI di n8n
      } else {
        aiReply = data.output || data.reply || (typeof data.message === "string" ? data.message : null) || data.text || aiReply;
      }

      // Hapus teks <think>...</think> yang sering dimunculkan model DeepSeek/Qwen
      aiReply = aiReply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Mohon maaf, sistem AI sedang offline atau terjadi gangguan jaringan.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Tombol Floating */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-5 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center group relative animate-bounce"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-10 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Butuh Bantuan?
          </span>
        </button>
      )}

      {/* Jendela Chat */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[32rem] max-h-[800px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h3 className="font-semibold text-zinc-100 text-lg">Yalla Store CS</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const parsedContent = isUser ? null : parseMessage(msg.content);

              return (
                <div
                  key={idx}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {isUser ? (
                    <div className="max-w-[85%] rounded-2xl px-4 py-2 text-base bg-primary text-primary-foreground rounded-tr-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full max-w-[100%]">
                      {/* Teks percakapan AI (selalu muncul jika ada teksnya) */}
                      {(parsedContent?.rawText || parsedContent?.type === "text") && (
                        <div className="max-w-[85%] rounded-2xl px-4 py-2 text-base bg-zinc-800 text-zinc-200 rounded-tl-sm self-start whitespace-pre-wrap">
                          {parsedContent.rawText || parsedContent.text || msg.content}
                        </div>
                      )}

                      {/* Kartu Produk (Single) */}
                      {parsedContent?.type === "product" && (
                        <div className="w-full sm:w-[260px] max-w-[260px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 hover:border-primary/50 transition-colors animate-in fade-in zoom-in duration-300">
                          <div className="w-full h-48 bg-zinc-800 relative group overflow-hidden">
                            <img 
                              src={parsedContent.gambar || "/placeholder.jpg"} 
                              alt={parsedContent.nama} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
                            <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                              PRODUK PILIHAN
                            </span>
                          </div>
                          <div className="p-4 flex flex-col">
                            <h4 className="font-bold text-zinc-100 text-base leading-snug line-clamp-2 min-h-[40px]">{parsedContent.nama}</h4>
                            <p className="text-primary font-black text-lg mt-1">Rp {parsedContent.harga}</p>
                            <button className="w-full mt-3 bg-white text-black hover:bg-zinc-200 py-2.5 rounded-xl text-sm font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                              <ShoppingCart className="w-4 h-4" />
                              Beli Sekarang
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Carousel Produk (Multiple) */}
                      {parsedContent?.type === "product_list" && Array.isArray(parsedContent.items) && (
                        <div className="w-full overflow-x-auto flex gap-3 pb-4 snap-x snap-mandatory animate-in fade-in zoom-in duration-300 -mx-4 px-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                          {parsedContent.items.map((item: any, i: number) => {
                            const formattedPrice = !isNaN(parseInt(item.harga)) 
                              ? parseInt(item.harga).toLocaleString('id-ID') 
                              : item.harga;
                            
                            return (
                              <div key={i} className="min-w-[220px] max-w-[220px] shrink-0 snap-center bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 hover:border-primary/50 transition-colors flex flex-col">
                                <div className="w-full h-36 bg-zinc-800/50 relative group overflow-hidden flex items-center justify-center p-2">
                                  <img 
                                    src={item.gambar || "/placeholder.jpg"} 
                                    alt={item.nama} 
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
                                </div>
                                <div className="p-3 flex flex-col flex-1">
                                  <h4 className="font-bold text-zinc-100 text-sm leading-snug line-clamp-2 min-h-[36px]">{item.nama}</h4>
                                  <p className="text-primary font-black text-base mt-1">Rp {formattedPrice}</p>
                                  <a href={item.kategori ? `/collection/${item.kategori}` : "/collection"} className="w-full mt-auto pt-2 bg-white text-black hover:bg-zinc-200 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <ShoppingCart className="w-3 h-3" />
                                    Lihat Produk
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={isLoading}
              className="flex-1 bg-zinc-800 text-zinc-100 text-base rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary text-primary-foreground p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

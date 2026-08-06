

async function testWebhook() {
  console.time("Webhook Latency");
  try {
    const res = await fetch("https://n8n.portofolio-mustofa.my.id/webhook/d6fd1f31-7dc1-47e9-bf17-120c1ce551ab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "halo", sessionId: "test123" })
    });
    
    const text = await res.text();
    console.timeEnd("Webhook Latency");
    console.log("Status:", res.status, res.statusText);
    console.log("Response Body:", text);
  } catch (err) {
    console.timeEnd("Webhook Latency");
    console.error("Error:", err);
  }
}

testWebhook();

const testCheckout = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerPhone: "08123456789",
        shippingAddress: "Test Address",
        items: [
          {
            productId: 1, // Number
            productName: "Test Product",
            quantity: 1,
            price: 150000,
            size: "M",
            color: "Red"
          }
        ]
      })
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

testCheckout();

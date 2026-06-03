export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                andritz: {
                    blue: "#0075BE",
                    dark: "#003B5C",
                    light: "#F4F6F8",
                    text: "#1F2937"
                }
            },
            boxShadow: {
                enterprise: "0 12px 30px rgba(0, 59, 92, 0.08)"
            }
        }
    },
    plugins: []
};

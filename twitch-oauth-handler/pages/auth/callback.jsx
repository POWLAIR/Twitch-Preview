import { useEffect } from "react";

export default function Callback() {
    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        const state = params.get("state");

        if (!token || !state) {
            document.body.innerText = "Erreur : paramètres manquants dans l'URL";
            return;
        }

        try {
            const { extensionId } = JSON.parse(atob(state));
            if (!extensionId) throw new Error();

            const redirectUrl = `moz-extension://${extensionId}/src/auth/auth.html#access_token=${token}`;
            window.location.href = redirectUrl;
        } catch {
            document.body.innerText = "Erreur : state invalide ou extensionId manquant";
        }
    }, []);

    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: "100vh", fontFamily: "sans-serif", backgroundColor: "#0E0E10", color: "#EFEFF1"
        }}>
            <div style={{ marginBottom: "1rem" }}>
                <div className="spinner" style={{
                    width: 40, height: 40,
                    border: "4px solid #9146FF",
                    borderTop: "4px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
            </div>
            <p>Authentification en cours...</p>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 - Page non trouvée | Twitch Preview OAuth</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <main className="container">
                <div className="error-content">
                    <div className="error-icon">🔍</div>
                    <h1>404</h1>
                    <h2>Page non trouvée</h2>
                    <p>
                        La page que vous recherchez n'existe pas ou a été déplacée.
                    </p>

                    <div className="actions">
                        <Link href="/" className="button primary">
                            🏠 Retour à l'accueil
                        </Link>
                        <a
                            href="https://github.com/username/twitch-preview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button secondary"
                        >
                            📚 Documentation
                        </a>
                    </div>

                    <div className="info">
                        <p>
                            <strong>Service OAuth pour Twitch Preview</strong><br />
                            Ce service gère uniquement l'authentification OAuth.
                        </p>
                    </div>
                </div>
            </main>

            <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0E0E10 0%, #18181B 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #EFEFF1;
        }

        .error-content {
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 6rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1rem 0;
          color: #EFEFF1;
        }

        p {
          font-size: 1.1rem;
          color: #ADADB8;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .button.primary {
          background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
          color: white;
        }

        .button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(145, 70, 255, 0.3);
        }

        .button.secondary {
          background: transparent;
          color: #EFEFF1;
          border-color: #2D2D2D;
        }

        .button.secondary:hover {
          border-color: #9146FF;
          background: rgba(145, 70, 255, 0.1);
        }

        .info {
          padding: 1.5rem;
          background: #18181B;
          border-radius: 12px;
          border: 1px solid #2D2D2D;
        }

        .info p {
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .container {
            padding: 1rem;
          }
          
          h1 {
            font-size: 4rem;
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .button {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
        </>
    );
}

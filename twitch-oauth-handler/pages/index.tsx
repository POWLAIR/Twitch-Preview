import Head from 'next/head';
import { GetStaticProps } from 'next';

interface Props {
  version: string;
  buildTime: string;
}

export default function Home({ version, buildTime }: Props) {
  return (
    <>
      <Head>
        <title>Twitch Preview OAuth Handler</title>
        <meta name="description" content="Service d'authentification OAuth pour l'extension Twitch Preview" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔐</text></svg>" />
      </Head>

      <main className="container">
        <div className="hero">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <h1>Twitch Preview</h1>
            <p className="subtitle">OAuth Authentication Handler</p>
          </div>

          <div className="info">
            <div className="status">
              <span className="status-indicator"></span>
              <span>Service en ligne</span>
            </div>

            <div className="version">
              <strong>Version:</strong> {version}
            </div>

            <div className="build-time">
              <strong>Dernière mise à jour:</strong> {buildTime}
            </div>
          </div>

          <div className="description">
            <h2>À propos</h2>
            <p>
              Ce service gère l'authentification OAuth de Twitch pour l'extension de navigateur
              <strong> Twitch Preview</strong>. Il permet aux utilisateurs de se connecter
              de manière sécurisée à leur compte Twitch.
            </p>
          </div>

          <div className="endpoints">
            <h2>Endpoints disponibles</h2>
            <div className="endpoint">
              <code>GET /api/auth/callback</code>
              <span>Handler de callback OAuth Twitch</span>
            </div>
          </div>

          <div className="links">
            <a
              href="https://github.com/powlair/twitch-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              📚 Documentation
            </a>
            <a
              href="https://dev.twitch.tv/docs/authentication/"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              🔗 API Twitch
            </a>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0E0E10 0%, #18181B 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #EFEFF1;
        }

        .hero {
          background: #18181B;
          border-radius: 16px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(145, 70, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
        }

        .logo {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #ADADB8;
          margin: 0;
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(145, 70, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(145, 70, 255, 0.1);
        }

        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .version, .build-time {
          font-size: 0.9rem;
          color: #ADADB8;
        }

        .description, .endpoints {
          margin-bottom: 2rem;
        }

        .description h2, .endpoints h2 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #EFEFF1;
        }

        .description p {
          line-height: 1.6;
          color: #ADADB8;
        }

        .endpoint {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 1rem;
          background: #0E0E10;
          border-radius: 8px;
          border: 1px solid #2D2D2D;
        }

        .endpoint code {
          font-family: 'Monaco', 'Menlo', monospace;
          color: #9146FF;
          font-weight: 600;
        }

        .endpoint span {
          font-size: 0.9rem;
          color: #ADADB8;
        }

        .links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(145, 70, 255, 0.1);
          border: 1px solid rgba(145, 70, 255, 0.3);
          border-radius: 8px;
          color: #EFEFF1;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .link:hover {
          background: rgba(145, 70, 255, 0.2);
          border-color: rgba(145, 70, 255, 0.5);
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .container {
            padding: 1rem;
          }
          
          .hero {
            padding: 2rem;
          }
          
          .logo h1 {
            font-size: 2rem;
          }
          
          .links {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const packageJson = await import('../package.json');

  return {
    props: {
      version: packageJson.version,
      buildTime: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  };
};

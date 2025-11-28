import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download as DownloadIcon, CheckCircle2, Package } from 'lucide-react';

export default function DownloadPage() {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download-app');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bikers-club-vtt-COMPLET.tar.gz';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Télécharger votre Application</h1>
          <p className="text-blue-100 text-lg">Bikers Club VTT - Système de Gestion Complet</p>
        </div>

        <Card className="bg-white shadow-2xl p-8 mb-8">
          <div className="flex items-start gap-6 mb-8">
            <Package className="w-12 h-12 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Archive Complète</h2>
              <p className="text-gray-600 mb-4">
                Fichier <strong>bikers-club-vtt-COMPLET.tar.gz</strong> (15 MB)
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  ✅ Tous les dossiers et fichiers<br/>
                  ✅ Code source complet (client + server)<br/>
                  ✅ Configuration build (Vite, TypeScript)<br/>
                  ✅ Images branding (logos, backgrounds)<br/>
                  ✅ Guide de déploiement<br/>
                  ✅ 149 fichiers - Rien ne manque
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-6"
            data-testid="button-download-app"
          >
            <DownloadIcon className="w-6 h-6 mr-3" />
            TÉLÉCHARGER MAINTENANT (15 MB)
          </Button>
        </Card>

        <Card className="bg-white shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Contenu de l'Archive
          </h3>

          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📁 Frontend (React)</h4>
              <p className="text-sm ml-4 text-gray-600">
                client/ - Pages, composants, styles Tailwind, React Query, authentification
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔧 Backend (Express.js)</h4>
              <p className="text-sm ml-4 text-gray-600">
                server/ - 31 API routes, authentification, gestion base de données
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🗂️ Données & Configuration</h4>
              <p className="text-sm ml-4 text-gray-600">
                shared/ - Schémas Drizzle ORM, Zod validations, TypeScript
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Assets Branding</h4>
              <p className="text-sm ml-4 text-gray-600">
                attached_assets/ - Logos, backgrounds, icônes groupes
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📚 Documentation</h4>
              <p className="text-sm ml-4 text-gray-600">
                DEPLOYMENT_GUIDE.md - Guide complet de déploiement (Linux, Heroku, DigitalOcean)
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-900 mb-3">⚠️ Après téléchargement</h4>
          <ol className="text-sm text-yellow-800 space-y-2 ml-4 list-decimal">
            <li>Extraire: <code className="bg-yellow-100 px-2 py-1 rounded">tar -xzf bikers-club-vtt-COMPLET.tar.gz</code></li>
            <li>Installer: <code className="bg-yellow-100 px-2 py-1 rounded">npm install</code></li>
            <li>Configurer PostgreSQL (voir DEPLOYMENT_GUIDE.md)</li>
            <li>Lancer: <code className="bg-yellow-100 px-2 py-1 rounded">npm run dev</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

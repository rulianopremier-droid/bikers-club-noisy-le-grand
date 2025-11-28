import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DropboxUpload() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpload = async () => {
    if (!token.trim()) {
      setResult({ success: false, message: 'Veuillez entrer votre Dropbox Access Token' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dropboxToken: token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `✅ Fichier uploadé vers Dropbox avec succès!\n\nVotre application se trouve maintenant dans votre Dropbox: /bikers-club-vtt-COMPLET.tar.gz`,
        });
        setToken('');
      } else {
        setResult({
          success: false,
          message: `❌ Erreur: ${data.error || 'Erreur lors de l\'upload'}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur réseau'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Uploader vers Dropbox</h1>
          <p className="text-blue-100 text-lg">Votre application directement dans votre Dropbox</p>
        </div>

        {/* Step 1: Get Token */}
        <Card className="bg-white shadow-2xl p-8 mb-8">
          <div className="flex items-start gap-6 mb-8">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Générer un Dropbox Token</h2>
              <ol className="space-y-3 text-gray-700 mb-6">
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit">a)</span>
                  <span>
                    Allez sur:{' '}
                    <a
                      href="https://www.dropbox.com/developers/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Dropbox Developers
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit">b)</span>
                  <span>Cliquez sur "Create app"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit">c)</span>
                  <span>Choisissez: Scoped access → Full Dropbox → App folder</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit">d)</span>
                  <span>Aller dans "Generated access token" et copier le token</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-fit">e)</span>
                  <span>Collez le token ci-dessous</span>
                </li>
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⚠️ Gardez ce token secret! C'est comme un mot de passe pour votre Dropbox.
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Paste Token & Upload */}
        <Card className="bg-white shadow-2xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Collez votre Token Dropbox</h2>

              <Input
                type="password"
                placeholder="Collez votre Dropbox Access Token ici..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mb-4 font-mono text-sm"
                data-testid="input-dropbox-token"
              />

              <Button
                onClick={handleUpload}
                disabled={loading || !token.trim()}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-6"
                data-testid="button-upload-dropbox"
              >
                <CloudUpload className="w-6 h-6 mr-3" />
                {loading ? 'Upload en cours...' : 'UPLOADER VERS DROPBOX (15 MB)'}
              </Button>

              {/* Result Message */}
              {result && (
                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="whitespace-pre-wrap font-mono text-sm">{result.message}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-white shadow-lg p-6 text-gray-700 text-sm space-y-2">
          <p>
            <strong>Après l'upload:</strong> Votre fichier sera dans votre Dropbox à:
            <code className="bg-gray-100 px-2 py-1 rounded mx-1">/Apps/Bikers-Club-VTT/</code>
          </p>
          <p>
            <strong>Taille:</strong> 15 MB
          </p>
          <p>
            <strong>Contenu:</strong> 149 fichiers - Code source complet, configuration, images branding, guide de déploiement
          </p>
        </Card>
      </div>
    </div>
  );
}

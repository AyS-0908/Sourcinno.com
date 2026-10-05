# Sourcinno

Site de conseil en stratégie, transformation, IA et venture building.

## Aperçu local

Dans PowerShell, depuis ce dossier :

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Ouvrir http://localhost:4173. Les liens internes nécessitent ce serveur ; ouvrir directement les fichiers HTML ne convient pas.

## Vérification

```powershell
node tools/check.mjs --all
node tools/version.mjs --check
```

Après une modification CSS ou JavaScript : `node tools/version.mjs`.

## Publication

Les changements sont préparés sur `rebuild`. Une fusion sur `main` ne publie rien : après approbation du propriétaire, le déploiement est lancé manuellement dans Coolify (déploiement automatique désactivé), puis le site public est vérifié.

Le formulaire V1 prépare un email dans la messagerie du visiteur. Le visiteur doit l’envoyer lui-même. L’envoi automatique est prévu pour une version ultérieure.

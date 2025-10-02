# 🚀 CHEATSHEET - DÉPLOIEMENT AUTO GITHUB → VPS HOSTINGER

## ⚡ Workflow
Windows (local) → GitHub → GitHub Actions → VPS → Site Live
________________________________________

## ✅ Dev Workflow
git add .
git commit -m "Message"
git push
➡️ Déploiement auto (~15s)
________________________________________

## 📊 Suivi
•	GitHub → Repo → Actions
•	Statut : ✅ (ok) / ❌ (erreur) / 🔄 (en cours)
•	Logs : cliquer sur un run
________________________________________

## ⚠️ Règle d’or
•	❌ NE PAS modifier sur le VPS
•	✅ Toujours : modifier → commit → git push
________________________________________

## 🔧 Dépannage rapide
1.	Lire logs GitHub Actions
2.	Erreurs fréquentes :
o	Permission denied → clé SSH invalide
o	No such file → mauvais DEPLOYMENT_PATH
o	Host key verification failed → déjà géré
3.	Tester manuellement :
```
ssh root@IP
cd /var/www/site.com
git pull origin main
```
4.	Relancer manuellement : GitHub → Actions → Run workflow
________________________________________

## 🆕 Nouveau projet (raccourci)
1.	Créer repo GitHub
2.	Générer clés SSH
3.	Configurer VPS : /var/www/mon-site
4.	Ajouter workflow .github/workflows/deploy.yml
5.	Configurer 4 secrets :
o	HOSTINGER_HOST
o	HOSTINGER_USERNAME
o	HOSTINGER_SSH_KEY
o	DEPLOYMENT_PATH
________________________________________

## 📋 Checklist
•	Repo GitHub ok
•	Clés SSH ok
•	Répertoire VPS ok
•	Workflow ajouté
•	Secrets configurés
•	Push effectué → déploiement ✅
________________________________________

## 🛡️ Sécurité
•	1 clé SSH par projet
•	Rotation 6-12 mois
•	Secrets jamais en dur
•	VPS à jour + firewall


# 📖 README - Déploiement Automatique GitHub → VPS Hostinger

## 🎯 Vue d'ensemble

Ce système permet de déployer automatiquement votre code depuis GitHub vers votre VPS Hostinger à chaque git push sur la branche main.

## 🏗️ Architecture du workflow
Windows (Local) → GitHub → GitHub Actions → VPS Hostinger → Site Live

________________________________________

## ✅ Workflow normal de développement
1.	Modifier le code localement (Windows / VS Code)
2.	Tester localement si nécessaire

Commiter les changements :
```
git add .
git commit -m "Description de tes modifications"
```

Pousser vers GitHub :
```
 git push
```

✨ Déploiement automatique !
•	GitHub Actions se déclenche automatiquement
•	Le code est déployé sur le VPS en ~15 secondes
•	Le site web est mis à jour

________________________________________
📊 Surveiller les déploiements
•	GitHub Actions : https://github.com/TON_USERNAME/TON_REPO/actions
•	Statut des runs : ✅ (succès) / ❌ (échec) / 🔄 (en cours)
•	Logs détaillés : cliquer sur un run pour voir les détails

________________________________________

## ⚠️ Que faire JAMAIS

❌ NE JAMAIS modifier directement sur le VPS
cd /var/www/tonsite.com
nano index.html  # ❌ Modifications perdues au prochain déploiement

✅ Toujours modifier sur Windows puis git push

cd "ton_projet_local"
```
code index.html  # Modifier dans VS Code
git add index.html
git commit -m "Update homepage"
git push  # Déploiement automatique
```
________________________________________

## 🔧 Dépannage

Workflow GitHub Actions en échec ❌
1.	Vérifier les logs :
 GitHub → Repository → Actions → Cliquer sur le run en échec → Lire le message d'erreur dans la section "Deploy to Hostinger VPS"
2.	Erreurs communes :

Erreur	Cause probable	Solution
Permission denied	Clé SSH invalide	Vérifier HOSTINGER_SSH_KEY dans les secrets
No such file or directory	Chemin incorrect	Vérifier DEPLOYMENT_PATH = /var/www/tonsite.com
Host key verification failed	Première connexion	StrictHostKeyChecking=no (déjà configuré)

Tester manuellement sur le VPS :
```
ssh root@TON_IP_VPS
cd /var/www/tonsite.com
git status
git pull origin main  # Doit fonctionner sans erreur
```

3.	Forcer un déploiement manuel :
 GitHub → Repository → Actions → "Deploy to Hostinger VPS" → "Run workflow"

________________________________________

## 🆕 Appliquer ce système à un nouveau projet

### Étape 1 : Préparer le nouveau projet
```
cd "C:\chemin\vers\nouveau\projet"
git init
git remote add origin https://github.com/USERNAME/NOUVEAU_REPO.git
```

### Étape 2 : Créer les clés SSH
```
ssh-keygen -t rsa -b 4096 -C "github-actions-nouveau-projet" -f %USERPROFILE%\.ssh\github_actions_nouveau_projet
type %USERPROFILE%\.ssh\github_actions_nouveau_projet.pub
```

### Étape 3 : Configurer le VPS
```
sudo mkdir -p /var/www/nouveau-site.com
sudo chown -R www-data:www-data /var/www/nouveau-site.com

echo "ssh-rsa AAAAB3...nouvelle_cle_publique...= github-actions-nouveau-projet" >> ~/.ssh/authorized_keys

cd /var/www/nouveau-site.com
git init
git remote add origin https://github.com/USERNAME/NOUVEAU_REPO.git
git config --global --add safe.directory /var/www/nouveau-site.com
```

### Étape 4 : Copier le workflow GitHub Actions
Créer : .github/workflows/deploy-hostinger.yml

```
name: Deploy to Hostinger VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4
      
    - name: Deploy to Hostinger VPS
      uses: appleboy/ssh-action@v1
      with:
        host: ${{ secrets.HOSTINGER_HOST }}
        username: ${{ secrets.HOSTINGER_USERNAME }}
        key: ${{ secrets.HOSTINGER_SSH_KEY }}
        script: |
          set -e
          cd ${{ secrets.DEPLOYMENT_PATH }}
          git fetch origin main
          git reset --hard origin/main
          echo "Deployment completed at $(date)"
```

### Étape 5 : Configurer les secrets GitHub
•	HOSTINGER_HOST → TON_IP_VPS
•	HOSTINGER_USERNAME → root
•	HOSTINGER_SSH_KEY → clé privée complète
•	DEPLOYMENT_PATH → /var/www/nouveau-site.com

### Étape 6 : Premier déploiement
```
git add .github/workflows/deploy-hostinger.yml
git add .
git commit -m "Initial commit with automated deployment"
git push -u origin main
```
________________________________________

## 📋 Checklist nouveau projet
•	Nouveau repository GitHub créé
•	Clés SSH générées et configurées
•	Répertoire VPS créé avec bonnes permissions
•	Workflow ajouté
•	4 secrets GitHub configurés
•	Premier push effectué avec succès ✅
•	Workflow GitHub Actions réussi ✅
•	Site accessible sur le VPS ✅
________________________________________

## 🛡️ Bonnes pratiques de sécurité

### 🔑 Gestion des clés SSH
•	Une paire de clés par projet (isolation)
•	Noms descriptifs : github_actions_[nom-projet]
•	Rotation tous les 6-12 mois

### 🔒 Secrets GitHub
•	Jamais de secrets en dur dans le code
•	Principe du moindre privilège
•	Audit régulier

### 🖥️ VPS
•	Mises à jour régulières
•	Firewall (ports 22, 80, 443 uniquement)
•	Monitoring des connexions SSH

________________________________________

## 📈 Optimisations possibles

### 🔔 Ajout de notifications
```
- name: Notify on success
  if: success()
  run: echo "Deployment successful! 🎉"

- name: Notify on failure  
  if: failure()
  run: echo "Deployment failed! ❌"
```

### 🧪 Tests automatiques avant déploiement
```
- name: Run tests
  run: npm test
  
- name: Deploy only if tests pass
  if: success()
  uses: appleboy/ssh-action@v1
```

## 💾 Backup automatique

script: |
  Backup avant déploiement
  ```tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz /var/www/tonsite.com```
  
  Déploiement normal
  ```
  cd ${{ secrets.DEPLOYMENT_PATH }}
  git fetch origin main
  git reset --hard origin/main
  ```
________________________________________

## 🆘 Support
En cas de problème :
•	Vérifier les logs GitHub Actions
•	Tester manuellement sur le VPS
•	Vérifier les secrets GitHub
•	Consulter ce README

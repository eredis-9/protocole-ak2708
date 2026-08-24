# Installer PROTOCOLE A.K2708 sur GitHub Pages

Cette archive contient déjà la configuration nécessaire. Le nom du dépôt est détecté automatiquement : tu peux l'appeler `artyom-ak2708` ou autrement.

## 1. Créer le dépôt

1. Connecte-toi sur <https://github.com/new>.
2. Écris `artyom-ak2708` dans **Repository name**.
3. Choisis **Public**.
4. Ne coche pas l'ajout d'un README, d'un `.gitignore` ou d'une licence.
5. Clique sur **Create repository**.

## 2. Envoyer les fichiers

1. Décompresse l'archive sur ton ordinateur.
2. Dans le dépôt vide, clique sur **uploading an existing file**.
3. Glisse le contenu du dossier décompressé, y compris le dossier `.github`. Ne dépose pas le ZIP lui-même.
4. Écris `Installation du site` dans **Commit changes**.
5. Clique sur **Commit changes**.

Si GitHub refuse le nombre de fichiers, utilise GitHub Desktop : **File → Add local repository → create a repository**, puis **Publish repository**.

## 3. Activer GitHub Pages

1. Ouvre l'onglet **Settings** du dépôt.
2. Dans le menu de gauche, clique sur **Pages**.
3. Dans **Build and deployment**, sélectionne **GitHub Actions** comme source.
4. Ouvre ensuite l'onglet **Actions** du dépôt.
5. Le workflow **Publier PROTOCOLE A.K2708 sur GitHub Pages** se lance automatiquement.
6. Attends que les deux étapes `build` et `deploy` deviennent vertes.

Ton site sera disponible à l'adresse :

```text
https://TON-PSEUDO.github.io/artyom-ak2708/
```

## 4. Mettre le site à jour

Modifie les fichiers sur GitHub ou envoie une nouvelle version. Chaque changement sur la branche `main` republie automatiquement le site.

Le texte et la logique narrative se trouvent dans `app/page.tsx`. Le design se trouve dans `app/globals.css`. Les images sont rangées dans `public/`.

## Si le déploiement ne démarre pas

- Vérifie que le dossier `.github/workflows/pages.yml` est bien présent.
- Vérifie que la branche principale s'appelle `main`.
- Dans **Settings → Pages**, la source doit être **GitHub Actions**.
- Dans **Actions**, ouvre l'étape rouge pour lire son message d'erreur.

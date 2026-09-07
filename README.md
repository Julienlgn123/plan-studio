<p align="center">
  <img src="https://raw.githubusercontent.com/Julienlgn123/plan-studio/main/banner.png" alt="Plan Studio" width="100%" />
</p>

<p align="center">Planning personnel local : événements, tâches, objectifs et rappels au même endroit.</p>

## Fonctionnalités

- **Aujourd'hui** — timeline de la journée avec tes événements placés à l'heure
- **Semaine** — vue en 7 colonnes pour voir ta semaine d'un coup d'œil
- **Mois** — calendrier mensuel avec un aperçu des événements et tâches de chaque jour
- **Agenda** — liste chronologique de tout ce qui s'en vient
- **Tâches** — gestion complète avec priorité, échéance et filtres
- **Objectifs** — suivi de progression avec barre visuelle

100% local — aucune donnée n'est envoyée sur un serveur. Tout est stocké dans une
base SQLite sur ton ordinateur.

## Installation

Plan Studio s'installe et se met à jour directement depuis [**Open Studio**](https://github.com/Julienlgn123/open-studio) :
télécharge sa dernière release, puis choisis Plan Studio dans son catalogue.

Tu peux aussi télécharger directement le `.dmg`/`.exe`/`.AppImage`/`.deb` de Plan
Studio depuis ses [Releases](https://github.com/Julienlgn123/plan-studio/releases/latest).

- **macOS uniquement** : Plan Studio n'a pas de certificat Apple Developer
  payant, la build n'est donc signée qu'en *ad-hoc*. Au premier lancement,
  macOS affiche **« Plan Studio est endommagée et ne peut pas être
  ouverte »** (le clic droit → Ouvrir ne suffit pas ici, contrairement à
  une app juste non-notariée). Pour débloquer :
  1. glisse `Plan Studio.app` dans `/Applications` depuis le `.dmg` monté,
  2. puis retire la quarantaine avec l'une de ces deux méthodes :
     - double-clique `Fix-macOS-Signature.command` présent dans le `.dmg`, ou
     - ouvre Terminal et lance :
       ```bash
       xattr -cr "/Applications/Plan Studio.app"
       ```

---

## Développement

<details>
<summary>Commandes pour contribuer au code</summary>

```bash
npm install
npm run dev        # lancer en mode développement
npm run typecheck   # vérifier les types
npm run build       # build de production
npm run dist        # packager pour Windows
```

</details>

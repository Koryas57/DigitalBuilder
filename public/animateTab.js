// Liste des icônes à alterner pour l'animation du favicon
let icons = [
    '/assets/images/react-title_icon.png',
    '/assets/images/react-blue_icon.png'
];

let iconIndex = 0;

// Texte du titre avec espaces insécables pour effet de boucle
let titleText = "Bienvenue sur mon Portfolio !\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\🧑‍💻\u00A0\u00A0";
let scrollIndex = 0;

// Fonction pour animer le favicon
function animateFavicon() {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = icons[iconIndex];
    iconIndex = (iconIndex + 1) % icons.length;
}

// Fonction pour faire défiler le texte du titre de l'onglet
function animateTitle() {
    document.title = titleText.slice(scrollIndex) + titleText.slice(0, scrollIndex);
    scrollIndex = (scrollIndex + 1) % titleText.length;
}

// Appel des fonctions d'animation
setInterval(animateFavicon, 875);  // Change l'icône toutes les 500 ms
setInterval(animateTitle, 85);    // Défilement continu du titre toutes les 200 ms

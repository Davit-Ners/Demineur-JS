const divGrille = document.querySelector('.grille');
const victoire = document.querySelector('.victoire');
const level = document.querySelector('#taille');
const btnStart = document.querySelector('#btn-start');
const divLevel = document.querySelector('.level');
let comptGenBombes = 0;
let compFirst = 0;
let game = true;
let comptWin = 0;
const alreadyChecked = [];
let comptRec = 0;
const DEPLACEMENT_POSSIBLES = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const grilleTaille = 600;

btnStart.addEventListener('click', function () {
    divLevel.style.position = 'absolute';
    divGrille.innerHTML = '';
    comptGenBombes = 0;
    compFirst = 0;
    game = true;
    const taille = level.value;

    const creerTable = function (taille) {
        const table = [];
        for (let i = 0; i < taille; i++) {
            table.push([]);
            for (let j = 0; j < taille; j++) {
                table[i].push({
                    hasBomb: false,
                    voisins: 0,
                    hasFlag: false,
                    isOpen: false
                });
            }
        }
        return table;
    }

    const mapJeu = creerTable(taille);

    // Fonction pour checker la victoire
    const checkWin = function (nbBombes) {
        console.log('checkwin');
        let comptFlag = 0;
        let comptPasOpen = 0;
        for (ligne of mapJeu) {
            for (block of ligne) {
                if (!block.isOpen || block.hasBomb) {
                    console.log(block);
                    comptPasOpen++;
                }
                if (block.hasFlag && block.hasBomb) {
                    comptFlag++;
                }
            }
        }
        console.log(nbBombes, "***", comptPasOpen)
        if (comptFlag == nbBombes) {
            game = false
            victoire.style.display = 'block';
        }
        if (comptPasOpen == nbBombes) {
            game = false;
            victoire.style.display = 'block';
        }
    }

    // Fonction pour creer un element HTML
    const creerElement = function (type, cclass = undefined, id = undefined, src = undefined, text = undefined) {
        const element = document.createElement(type);
        if (cclass) { element.setAttribute('class', cclass) };
        if (id) { element.setAttribute('id', id) };
        if (src) { element.setAttribute('src', src) };
        if (text) { element.textContent = text };
        return element;
    }

    // Fonction pour checker les cases voisines
    const checkVoisins = function (elem) {
        console.log('VOISINS');
        const emplacement = elem.id.split('-');
        const emplacement0 = Number(emplacement[0]);
        const emplacement1 = Number(emplacement[1]);
        const voisins = [[0]]
        const deplacementPossibles = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        voisins.push(deplacementPossibles);

        for (dep of deplacementPossibles) {
            if (emplacement0 + dep[0] >= 0 && emplacement1 + dep[1] >= 0 && emplacement0 + dep[0] < taille && emplacement1 + dep[1] < taille) {
                if (mapJeu[emplacement0 + dep[0]][emplacement1 + dep[1]].hasBomb) {
                    voisins[0]++;
                }
            }
        }
        return voisins;
    }

    // Fonction pour générer des bombes aléatoires
    const genererBombes = function (nbBombes, interdit) {
        let compteur = 0;
        const interditEmplacement = interdit.id.split('-');
        const interditLigne = Number(interditEmplacement[0]);
        const interditColonne = Number(interditEmplacement[1]);

        while (compteur < nbBombes) {
            console.log('BOMBE');
            let emplacement0 = Math.floor(Math.random() * taille);
            let emplacement1 = Math.floor(Math.random() * taille);

            if (!(mapJeu[emplacement0][emplacement1].hasBomb) &&
                !(emplacement0 === interditLigne && emplacement1 === interditColonne)) {

                let compt2 = 0;
                for (dep of DEPLACEMENT_POSSIBLES) {
                    if (interditLigne + dep[0] === emplacement0 && interditColonne + dep[1] === emplacement1) {
                        compt2++;
                    }
                }

                if (compt2 === 0) {
                    mapJeu[emplacement0][emplacement1].hasBomb = true;
                    compteur++;
                }
            }
        }
    }


    // Fonction pour gerer le placement et sorties des drapeaux
    const clickDroit = function (elem, block) {
        if (!block.hasFlag) {
            const drapeau = creerElement('img', 'flag', undefined, 'images/flag.webp');
            elem.append(drapeau);
            block.hasFlag = true;
        } else {
            elem.innerHTML = '';
            block.hasFlag = false;
        }
        checkWin(taille);
    }

    // Fonction de propagation
    const propagation = function (elem) {
        setTimeout(function () {
            console.log('PROPAGATION');
            const emplacement = elem.id.split('-');
            const emplacement0 = Number(emplacement[0]);
            const emplacement1 = Number(emplacement[1]);
            if (!(mapJeu[emplacement0][emplacement1].hasBomb)) {
                alreadyChecked.push(elem);
                divGrille.innerHTML = '';
                const voisins = checkVoisins(elem)[0];
                mapJeu[emplacement0][emplacement1].voisins = voisins;
                mapJeu[emplacement0][emplacement1].isOpen = true;
                console.log(`Ouverture de ${elem.id}`);
                creerGrille(taille);
                for (dep of DEPLACEMENT_POSSIBLES) {
                    const nvElem = document.getElementById(`${emplacement0 + dep[0]}-${emplacement1 + dep[1]}`);
                    if (nvElem &&
                        !(mapJeu[emplacement0 + dep[0]][emplacement1 + dep[1]].isOpen) &&
                        (voisins == 0 || compFirst == 0) &&
                        !(mapJeu[emplacement0 + dep[0]][emplacement1 + dep[1]].hasBomb) &&
                        !(mapJeu[emplacement0 + dep[0]][emplacement1 + dep[1]].hasFlag)) {
                            mapJeu[emplacement0 + dep[0]][emplacement1 + dep[1]].isOpen = true;
                            comptRec++;
                            console.log(`ENTREE RECURSIVE X ${comptRec} et DEP ${dep} de ELEM ${elem.id}`);
                            compFirst++;
                            propagation(nvElem);
                    }
                }
            }
            else if (mapJeu[emplacement0][emplacement1].hasBomb) {
                divGrille.innerHTML = '';
                for (elem of mapJeu) {
                    for (block of elem) {
                        if (block.hasBomb) {
                            block.isOpen = true;
                        }
                    }
                }
                game = false;
                creerGrille(taille);
                const over = document.querySelector('.over');
                over.style.display = 'block';
                over.style.animation = 'app 2s';
            }
        }, 5);
        
    }

    // Fonction pour creer le jeu
    const creerGrille = function (taille) {
        console.log('CREER GRILLE');
        let comptRange = 0;
        for (const ligne of mapJeu) {
            const range = creerElement('div', 'ligne');
            let comptBlock = 0;
            for (const block of ligne) {
                if (block.isOpen) {
                    const elem = creerElement('div', 'blockBlanc');
                    elem.style.width = `${grilleTaille / taille}px`;
                    elem.style.height = `${grilleTaille / taille}px`;
                    elem.setAttribute('id', `${comptRange}-${comptBlock}`);
                    comptBlock++;
                    if (block.voisins > 0) {
                        const p = creerElement('p');
                        p.textContent = block.voisins;
                        elem.append(p);
                    }
                    range.append(elem);
                    if (game) {
                        elem.addEventListener('click', function () {
                            if (comptGenBombes == 0) {
                                genererBombes(taille, elem);
                                comptGenBombes++;
                            }
                            propagation(elem);
                            console.log('ok');
                        });
                    }
                    if (block.hasBomb) {
                        elem.classList.remove('blockBlanc');
                        elem.classList.add('blockRouge');
                        elem.style.width = `${grilleTaille / taille}px`;
                        elem.style.height = `${grilleTaille / taille}px`;
                    }
                }
                else if (!block.isOpen) {
                    const elem = creerElement('div', 'blockGris');
                    elem.style.width = `${grilleTaille / taille}px`;
                    elem.style.height = `${grilleTaille / taille}px`;
                    elem.setAttribute('id', `${comptRange}-${comptBlock}`);
                    comptBlock++;
                    range.append(elem);
                    if (game) {
                        elem.addEventListener('click', function () {
                            if (comptGenBombes == 0) {
                                genererBombes(taille, elem);
                                comptGenBombes++;
                            }
                            propagation(elem);
                        });
                        elem.addEventListener('contextmenu', function (evt) { clickDroit(elem, block); evt.preventDefault()});
                    }
                    if (block.hasFlag) {
                        const drapeau = creerElement('img', 'flag', undefined, 'images/flag.webp');
                        elem.append(drapeau);
                    }
                }
            }
            divGrille.append(range);
            comptRange++;
        }
        checkWin(taille);
    }



    creerGrille(taille);
});
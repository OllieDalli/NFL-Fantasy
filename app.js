/* =========================================================
   NFL DRAFT FRIENDS LEAGUE
   MAIN JAVASCRIPT
   ========================================================= */


/* ---------------------------------------------------------
   PLAYER DATA
   --------------------------------------------------------- */

const players = [
    {
        id: "oliver",
        name: "Oliver",
        teams: [
            "Seattle Seahawks",
            "Baltimore Ravens",
            "Denver Broncos",
            "Indianapolis Colts",
            "Pittsburgh Steelers",
            "Atlanta Falcons",
            "Tennessee Titans",
            "New Orleans Saints"
        ]
    },

    {
        id: "burke",
        name: "Burke",
        teams: [
            "Philadelphia Eagles",
            "San Francisco 49ers",
            "New England Patriots",
            "Jacksonville Jaguars",
            "Tampa Bay Buccaneers",
            "Arizona Cardinals",
            "Washington Commanders",
            "Miami Dolphins"
        ]
    },

    {
        id: "kian",
        name: "Kian",
        teams: [
            "Los Angeles Rams",
            "Buffalo Bills",
            "Los Angeles Chargers",
            "Houston Texans",
            "Chicago Bears",
            "Minnesota Vikings",
            "New York Giants",
            "New York Jets"
        ]
    },

    {
        id: "taylor",
        name: "Taylor",
        teams: [
            "Kansas City Chiefs",
            "Detroit Lions",
            "Cincinnati Bengals",
            "Dallas Cowboys",
            "Green Bay Packers",
            "Carolina Panthers",
            "Cleveland Browns",
            "Las Vegas Raiders"
        ]
    }
];


/* ---------------------------------------------------------
   SCORE STORAGE
   --------------------------------------------------------- */

let scores = {};


/* ---------------------------------------------------------
   LOAD SCORES
   --------------------------------------------------------- */

function loadScores() {

    const savedScores = localStorage.getItem("nflDraftScores");

    if (savedScores) {

        try {

            const parsedScores = JSON.parse(savedScores);

            if (
                parsedScores &&
                typeof parsedScores === "object"
            ) {
                scores = parsedScores;
            }

        } catch (error) {

            console.error(
                "Could not load saved scores:",
                error
            );

            scores = {};
        }
    }


    players.forEach(function(player) {

        if (
            typeof scores[player.id] !== "number" ||
            !Number.isFinite(scores[player.id])
        ) {
            scores[player.id] = 0;
        }

        if (scores[player.id] < 0) {
            scores[player.id] = 0;
        }

    });


    saveScores();
}


/* ---------------------------------------------------------
   SAVE SCORES
   --------------------------------------------------------- */

function saveScores() {

    localStorage.setItem(
        "nflDraftScores",
        JSON.stringify(scores)
    );
}


/* ---------------------------------------------------------
   SORT PLAYERS
   --------------------------------------------------------- */

function getSortedPlayers() {

    return [...players].sort(function(a, b) {

        const scoreA = scores[a.id] || 0;
        const scoreB = scores[b.id] || 0;

        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }

        return players.indexOf(a) - players.indexOf(b);
    });
}


/* ---------------------------------------------------------
   INITIALS
   --------------------------------------------------------- */

function getInitials(name) {

    return name
        .split(" ")
        .map(function(word) {
            return word.charAt(0);
        })
        .join("")
        .toUpperCase();
}


/* ---------------------------------------------------------
   LEADERBOARD
   --------------------------------------------------------- */

function renderLeaderboard() {

    const leaderboardRows =
        document.getElementById("leaderboardRows");

    if (!leaderboardRows) {
        return;
    }


    leaderboardRows.innerHTML = "";


    const sortedPlayers = getSortedPlayers();


    sortedPlayers.forEach(function(player, index) {

        const rank = index + 1;
        const points = scores[player.id] || 0;

        const row = document.createElement("div");

        row.className =
            "leaderboard-row rank-" + rank;


        row.innerHTML = `
            <div class="player-rank">
                <span class="rank-number">${rank}</span>
            </div>

            <div class="player-info">
                <div class="player-avatar">
                    ${getInitials(player.name)}
                </div>

                <div class="player-name">
                    ${player.name}
                </div>
            </div>

            <div class="player-points">
                ${points}
                <span class="points-label">PTS</span>
            </div>
        `;


        leaderboardRows.appendChild(row);

    });
}


/* ---------------------------------------------------------
   DRAFTED TEAMS
   --------------------------------------------------------- */

function renderTeams() {

    const teamsGrid =
        document.getElementById("teamsGrid");

    if (!teamsGrid) {
        return;
    }


    teamsGrid.innerHTML = "";


    players.forEach(function(player) {

        const card = document.createElement("div");

        card.className = "team-card";


        let teamListHTML = "";


        player.teams.forEach(function(team, index) {

            teamListHTML += `
                <div class="team-item">
                    <span class="team-number">
                        ${index + 1}
                    </span>

                    <span>
                        ${team}
                    </span>
                </div>
            `;

        });


        card.innerHTML = `
            <div class="team-card-header">

                <span class="team-owner">
                    ${player.name}
                </span>

                <span class="team-count">
                    ${player.teams.length} TEAMS
                </span>

            </div>

            <div class="team-list">
                ${teamListHTML}
            </div>
        `;


        teamsGrid.appendChild(card);

    });
}


/* ---------------------------------------------------------
   MANAGE PLAYERS
   --------------------------------------------------------- */

function renderManagePlayers() {

    const managePlayers =
        document.getElementById("managePlayers");

    if (!managePlayers) {
        return;
    }


    managePlayers.innerHTML = "";


    players.forEach(function(player) {

        const points = scores[player.id] || 0;

        const playerCard =
            document.createElement("div");

        playerCard.className =
            "manage-player";


        playerCard.innerHTML = `
            <div class="manage-player-info">

                <div class="manage-avatar">
                    ${getInitials(player.name)}
                </div>

                <div>
                    <div class="manage-player-name">
                        ${player.name}
                    </div>

                    <div class="manage-player-score">
                        Current total: ${points} points
                    </div>
                </div>

            </div>


            <div class="manage-controls">

                <button
                    class="score-button score-minus"
                    type="button"
                    data-player="${player.id}"
                    data-change="-1"
                    aria-label="Remove one point from ${player.name}"
                >
                    −
                </button>

                <div class="current-score">
                    ${points}
                </div>

                <button
                    class="score-button score-plus"
                    type="button"
                    data-player="${player.id}"
                    data-change="1"
                    aria-label="Add one point to ${player.name}"
                >
                    +
                </button>

            </div>
        `;


        managePlayers.appendChild(playerCard);

    });


    const scoreButtons =
        document.querySelectorAll(".score-button");


    scoreButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const playerId =
                    button.getAttribute("data-player");

                const change =
                    Number(
                        button.getAttribute("data-change")
                    );


                changePoints(
                    playerId,
                    change
                );

            }
        );

    });
}


/* ---------------------------------------------------------
   CHANGE POINTS
   --------------------------------------------------------- */

function changePoints(playerId, amount) {

    if (!scores.hasOwnProperty(playerId)) {
        scores[playerId] = 0;
    }


    const newScore =
        scores[playerId] + amount;


    if (newScore < 0) {
        scores[playerId] = 0;
    } else {
        scores[playerId] = newScore;
    }


    saveScores();

    renderAll();
}


/* ---------------------------------------------------------
   RESET ALL POINTS
   --------------------------------------------------------- */

function resetAllPoints() {

    const confirmed =
        window.confirm(
            "Are you sure you want to reset all points to zero?"
        );


    if (!confirmed) {
        return;
    }


    players.forEach(function(player) {

        scores[player.id] = 0;

    });


    saveScores();

    renderAll();
}


/* ---------------------------------------------------------
   SHOW SECTION
   --------------------------------------------------------- */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".page-section");


    sections.forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });


    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    const navButtons =
        document.querySelectorAll(".nav-button");


    navButtons.forEach(function(button) {

        const buttonSection =
            button.getAttribute("data-section");


        if (buttonSection === sectionId) {

            button.classList.add("active");

        } else {

            button.classList.remove("active");

        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ---------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------- */

function setupNavigation() {

    const navButtons =
        document.querySelectorAll(".nav-button");


    navButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const sectionId =
                    button.getAttribute(
                        "data-section"
                    );


                showSection(sectionId);

            }
        );

    });


    const brandButton =
        document.getElementById("brandButton");


    if (brandButton) {

        brandButton.addEventListener(
            "click",
            function() {

                showSection("leaderboard");

            }
        );

    }


    const resetButton =
        document.getElementById("resetButton");


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetAllPoints
        );

    }
}


/* ---------------------------------------------------------
   RENDER EVERYTHING
   --------------------------------------------------------- */

function renderAll() {

    renderLeaderboard();

    renderTeams();

    renderManagePlayers();
}


/* ---------------------------------------------------------
   START APPLICATION
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadScores();

        setupNavigation();

        renderAll();

    }
);
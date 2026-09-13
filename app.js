const SUPABASE_URL = "https://tyjirdcljmpkcwtmoasn.supabase.co";
const SUPABASE_KEY = "sb_publishable_EAd6M_wH9EbQGkg4n8ho8w_2HQPpmKo";

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


/* =========================================================
   SUPABASE REQUEST HELPER
   ========================================================= */

async function supabaseRequest(endpoint, options = {}) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${endpoint}`,
        {
            ...options,

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation",

                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Supabase error ${response.status}: ${errorText}`
        );
    }

    const text = await response.text();

    if (!text) {
        return null;
    }

    return JSON.parse(text);
}


/* =========================================================
   GET SCORES
   ========================================================= */

async function getScores() {

    try {

        const data = await supabaseRequest(
            "players?select=player_id,name,points"
        );

        const scores = {};

        data.forEach(player => {

            scores[player.player_id] =
                Number(player.points) || 0;

        });

        return scores;

    } catch (error) {

        console.error(
            "Could not load scores:",
            error
        );

        return null;
    }
}


/* =========================================================
   UPDATE SCORE
   ========================================================= */

async function updateScore(playerId, newScore) {

    if (newScore < 0) {
        newScore = 0;
    }

    try {

        await supabaseRequest(
            `players?player_id=eq.${encodeURIComponent(playerId)}`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    points: newScore
                })
            }
        );

        return true;

    } catch (error) {

        console.error(
            "Could not update score:",
            error
        );

        alert(
            "There was a problem updating the score. Please try again."
        );

        return false;
    }
}


/* =========================================================
   LOAD LEADERBOARD
   ========================================================= */

async function renderLeaderboard() {

    const leaderboardRows =
        document.getElementById("leaderboardRows");

    if (!leaderboardRows) {
        return;
    }


    leaderboardRows.innerHTML = `
        <div class="loading-message">
            Loading scores...
        </div>
    `;


    const scores = await getScores();


    if (!scores) {

        leaderboardRows.innerHTML = `
            <div class="error-message">
                Unable to load the leaderboard.
                Please refresh the page.
            </div>
        `;

        return;
    }


    const sortedPlayers = [...players].sort(
        (a, b) => {

            const scoreA = scores[a.id] || 0;
            const scoreB = scores[b.id] || 0;

            return scoreB - scoreA;
        }
    );


    leaderboardRows.innerHTML = "";


    sortedPlayers.forEach((player, index) => {

        const rank = index + 1;
        const points = scores[player.id] || 0;

        const row =
            document.createElement("div");

        row.className =
            `leaderboard-row rank-${rank}`;


        row.innerHTML = `

            <div class="player-rank">
                <span class="rank-number">
                    ${rank}
                </span>
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
                <span class="points-label">
                    PTS
                </span>
            </div>

        `;


        leaderboardRows.appendChild(row);

    });
}


/* =========================================================
   DRAFTED TEAMS
   ========================================================= */

function renderTeams() {

    const teamsGrid =
        document.getElementById("teamsGrid");

    if (!teamsGrid) {
        return;
    }


    teamsGrid.innerHTML = "";


    players.forEach(player => {

        const card =
            document.createElement("div");

        card.className = "team-card";


        const teamList =
            player.teams.map(
                (team, index) => `
                    <div class="team-item">

                        <span class="team-number">
                            ${index + 1}
                        </span>

                        <span>
                            ${team}
                        </span>

                    </div>
                `
            ).join("");


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
                ${teamList}
            </div>

        `;


        teamsGrid.appendChild(card);

    });
}


/* =========================================================
   MANAGE POINTS
   ========================================================= */

async function renderManagePlayers() {

    const container =
        document.getElementById("managePlayers");

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading-message">
            Loading scores...
        </div>
    `;


    const scores = await getScores();


    if (!scores) {

        container.innerHTML = `
            <div class="error-message">
                Unable to load scores.
                Please refresh the page.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    players.forEach(player => {

        const points =
            scores[player.id] || 0;


        const card =
            document.createElement("div");

        card.className = "manage-player";


        card.innerHTML = `

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
                >
                    +
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    document
        .querySelectorAll(".score-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const playerId =
                        button.dataset.player;

                    const change =
                        Number(button.dataset.change);


                    button.disabled = true;


                    const scores =
                        await getScores();


                    if (!scores) {

                        button.disabled = false;
                        return;

                    }


                    const currentScore =
                        scores[playerId] || 0;


                    const newScore =
                        Math.max(
                            0,
                            currentScore + change
                        );


                    const success =
                        await updateScore(
                            playerId,
                            newScore
                        );


                    button.disabled = false;


                    if (success) {

                        await renderAll();

                    }

                }
            );

        });
}


/* =========================================================
   RESET SCORES
   ========================================================= */

async function resetAllPoints() {

    const confirmed =
        window.confirm(
            "Are you sure you want to reset all points to zero?"
        );


    if (!confirmed) {
        return;
    }


    try {

        for (const player of players) {

            await updateScore(
                player.id,
                0
            );

        }


        await renderAll();


    } catch (error) {

        console.error(
            "Could not reset scores:",
            error
        );

    }
}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionId
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   NAVIGATION SETUP
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.section
                    );

                }
            );

        });


    const brandButton =
        document.getElementById("brandButton");


    if (brandButton) {

        brandButton.addEventListener(
            "click",
            () => showSection("leaderboard")
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


/* =========================================================
   LIVE SCORE REFRESH
   ========================================================= */

let refreshTimer = null;


function startLiveUpdates() {

    if (refreshTimer) {
        clearInterval(refreshTimer);
    }


    refreshTimer = setInterval(
        async () => {

            await renderLeaderboard();

            const activeSection =
                document.querySelector(
                    ".page-section.active-section"
                );


            if (
                activeSection &&
                activeSection.id === "manage"
            ) {
                await renderManagePlayers();
            }

        },
        5000
    );
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

async function renderAll() {

    renderTeams();

    await renderLeaderboard();

    await renderManagePlayers();
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();

        await renderAll();

        startLiveUpdates();

    }
);
const SUPABASE_URL = "https://tyjjrdcljmpkcwtmoasn.supabase.co";
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
   SUPABASE
   ========================================================= */

let supabaseClient = null;

function initialiseSupabase() {

    if (!window.supabase) {
        console.error("Supabase library has not loaded.");
        return false;
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    return true;
}


/* =========================================================
   LOAD SCORES
   ========================================================= */

async function getScores() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase has not been initialised."
        );

    }

    const {
        data,
        error
    } = await supabaseClient
        .from("players")
        .select("player_id,name,points");

    if (error) {
        throw error;
    }

    const scores = {};

    data.forEach(player => {

        scores[player.player_id] =
            Number(player.points) || 0;

    });

    return scores;
}


/* =========================================================
   UPDATE SCORE
   ========================================================= */

async function updateScore(playerId, newScore) {

    if (newScore < 0) {
        newScore = 0;
    }

    const {
        error
    } = await supabaseClient
        .from("players")
        .update({
            points: newScore
        })
        .eq("player_id", playerId);

    if (error) {
        console.error("Could not update score:", error);
        throw error;
    }
}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();
}


/* =========================================================
   LEADERBOARD
   ========================================================= */

async function renderLeaderboard() {

    const container =
        document.getElementById("leaderboardRows");

    if (!container) {
        return;
    }

    try {

        const scores = await getScores();

        const sortedPlayers = [...players].sort(
            (a, b) => {

                const scoreA = scores[a.id] || 0;
                const scoreB = scores[b.id] || 0;

                return scoreB - scoreA;
            }
        );

        container.innerHTML = "";

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

            container.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Could not load scores:",
            error
        );

        container.innerHTML = `
            <div class="error-message">
                Unable to connect to the score database.
                Please check the Supabase connection.
            </div>
        `;
    }
}


/* =========================================================
   DRAFTED TEAMS
   ========================================================= */

function renderTeams() {

    const container =
        document.getElementById("teamsGrid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

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

        container.appendChild(card);

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

    try {

        const scores = await getScores();

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
                            Number(
                                button.dataset.change
                            );

                        button.disabled = true;

                        try {

                            const scores =
                                await getScores();

                            const currentScore =
                                scores[playerId] || 0;

                            const newScore =
                                Math.max(
                                    0,
                                    currentScore + change
                                );

                            await updateScore(
                                playerId,
                                newScore
                            );

                            await renderAll();

                        } catch (error) {

                            console.error(
                                "Score update failed:",
                                error
                            );

                            alert(
                                "The score could not be updated. Check the database connection."
                            );

                        } finally {

                            button.disabled = false;

                        }

                    }
                );

            });

    } catch (error) {

        console.error(
            "Could not load manage points:",
            error
        );

        container.innerHTML = `
            <div class="error-message">
                Unable to connect to the score database.
            </div>
        `;
    }
}


/* =========================================================
   RESET
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

        alert(
            "The scores could not be reset."
        );
    }
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

    const selected =
        document.getElementById(sectionId);

    if (selected) {

        selected.classList.add(
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

    const brand =
        document.getElementById("brandButton");

    if (brand) {

        brand.addEventListener(
            "click",
            () => showSection("leaderboard")
        );

    }

    const reset =
        document.getElementById("resetButton");

    if (reset) {

        reset.addEventListener(
            "click",
            resetAllPoints
        );

    }
}


/* =========================================================
   LIVE UPDATES
   ========================================================= */

function startLiveUpdates() {

    setInterval(
        async () => {

            await renderLeaderboard();

            const active =
                document.querySelector(
                    ".page-section.active-section"
                );

            if (
                active &&
                active.id === "manage"
            ) {
                await renderManagePlayers();
            }

        },
        5000
    );
}


/* =========================================================
   RENDER ALL
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

        const connected =
            initialiseSupabase();

        if (!connected) {

            alert(
                "The Supabase library could not be loaded."
            );

            return;
        }

        setupNavigation();

        await renderAll();

        startLiveUpdates();

    }
);
const BASE_URL = 'https://statsapi.web.nhl.com/api/v1';
let bigArray = [];
let anotherArray = [];
let teamArray = [];

let championTeam = "Tampa Bay Lightning";

var start = new Date(2021, 9, 12);
var end = new Date();

async function createTeams() {
    const response = await fetch(BASE_URL + '/teams', {
        headers: {
            'Accept': 'application/json'
        }
    });
    const stuff = await response.json();

    for (let i = 0; i < stuff.teams.length; i++) {
        teamArray.push({
            name: stuff.teams[i].name,
            id: stuff.teams[i].id,
            points: 0,
            loss: 0
        })
    }
}

async function scheduleFinder() {
    await createTeams();
    for (var day = start; day <= end; day.setDate(day.getDate() + 1)) {

        date = day.toISOString().slice(0, 10);
        const response = await fetch(BASE_URL + `/schedule?date=${date}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const list = await response.json();

        bigArray.push(list);
    }
    somethingTT();
}

function somethingTT() {

    for (let j = 0; j < bigArray.length; j++) {
        let tempArray = [];
        for (let i = 0; i < bigArray[j].dates[0].games.length; i++) {
            let awayTeam = bigArray[j].dates[0].games[i].teams.away.team.name;
            let awayScore = bigArray[j].dates[0].games[i].teams.away.score;
            let homeTeam = bigArray[j].dates[0].games[i].teams.home.team.name;
            let homeScore = bigArray[j].dates[0].games[i].teams.home.score;
            let gameDate = bigArray[j].dates[0].date;
            let isFinal = bigArray[j].dates[0].games[i].status.detailedState;
            if (homeScore > awayScore && isFinal == 'Final') {
                tempArray.push({
                    winTeam: homeTeam,
                    lossTeam: awayTeam,
                    gameDate: gameDate
                });
            } else if (awayScore > homeScore && isFinal == 'Final') {
                tempArray.push({
                    winTeam: awayTeam,
                    lossTeam: homeTeam,
                    gameDate: gameDate
                });
            } else {
                tempArray.push(`${homeTeam} vs. ${awayTeam}`);
            }
        }
        anotherArray.push(tempArray);
    }
    console.log(anotherArray);
    championPoints();
    upcomingMatch();
}


function championPoints() {

    for (let i = 0; i < anotherArray.length; i++) {
        for (let j = 0; j < anotherArray[i].length; j++) {
            if (anotherArray[i][j].winTeam == championTeam || anotherArray[i][j].lossTeam == championTeam) {
                championTeam = anotherArray[i][j].winTeam;
                const indexW = teamArray.map(e => e.name).indexOf(`${championTeam}`);
                teamArray[indexW].points += 1;
                const indexL = teamArray.map(e => e.name).indexOf(`${anotherArray[i][j].lossTeam}`);
                teamArray[indexL].loss += 1;
            }
        }
    }
    sortArray(teamArray);
    createTable(teamArray);
}


async function upcomingMatch() {
    let upcomingArray = [];
    let indexC;
    const index = teamArray.map(e => e.name).indexOf(`${championTeam}`);
    const response = await fetch(BASE_URL + `/teams/${teamArray[index].id}?expand=team.schedule.next`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const match = await response.json();
    upcomingArray.push(match);
    console.log(upcomingArray);
    let gameTime = upcomingArray[0].teams[0].nextGameSchedule.dates[0].games[0].gameDate;
    let homeTeam = upcomingArray[0].teams[0].nextGameSchedule.dates[0].games[0].teams.home.team.name;
    let homeScore = upcomingArray[0].teams[0].nextGameSchedule.dates[0].games[0].teams.home.score;
    let awayTeam = upcomingArray[0].teams[0].nextGameSchedule.dates[0].games[0].teams.away.team.name;
    let awayScore = upcomingArray[0].teams[0].nextGameSchedule.dates[0].games[0].teams.away.score;
    if (homeTeam == championTeam) {
        indexC = teamArray.map(e => e.name).indexOf(`${awayTeam}`);
        champScore = homeScore;
        challengeScore = awayScore;
    } else {
        indexC = teamArray.map(e => e.name).indexOf(`${homeTeam}`);
        challengeScore = homeScore;
        champScore = awayScore;
    }
    picck(index, indexC);
    timer(gameTime, champScore, challengeScore);
    //console.log(bigArray);
}

function timer(time, champScore, challengeScore) {
    // Set the date we're counting down to
    var countDownDate = new Date(`${time}`).getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);



        let championTeamScore = 0;
        //If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("scoreOrTimer").innerHTML = champScore + ' to ' +
                challengeScore;
        } else {
            document.getElementById("scoreOrTimer").innerHTML = days + "d " + hours + "h " +
                minutes + "m " + seconds + "s ";
        }
    }, 1000);
}


scheduleFinder();


function sortArray(array) {
    let sortedArray = array.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
    console.log(sortedArray);
}

function createTable(array) {
    var table = document.getElementById('winnerTable');

    for (let i = 0; i < array.length; i++) {
        if (array[i].points > 0) {
            let row = `<tr>
                        <td><img src='imgs/${array[i].id}.png' width = '100 px'></img> ${array[i].name}</td>
                        <td>${array[i].points}</td>
                    </tr>`
            table.innerHTML += row;
        }
    }
}

function picck(index, indexC) {
    let champPic = document.getElementById('champPic');
    let challengePic = document.getElementById('challengePic');

    champPic.innerHTML = `<img src='imgs/${teamArray[index].id}.png'></img>
                        <br>
                        <p class="record">(${teamArray[index].points}-${teamArray[index].loss})</p>`;
    challengePic.innerHTML = `<img src='imgs/${teamArray[indexC].id}.png'></img>
                        <br>
                        <p class="record">(${teamArray[indexC].points}-${teamArray[indexC].loss})</p>`;
}
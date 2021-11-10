var round = 1,
    pick = 1,
    overall = 1,
    team_pick = 1,
    total_rounds = 18,
    total_teams = 12;

$('button').on('click', function() {

    round = Math.floor(((overall - 1) / total_teams) + 1);
    pick = ((overall - 1) % total_teams) + 1;
    team_pick = (round % 2) ? pick : (round * total_teams) - overall + 1;
    overall++;

    console.log('Round: ' + round + ' | Pick: ' + pick + ' | Overall: ' + overall + ' | Team Pick: ' + team_pick);
    console.log(teamArray);


});
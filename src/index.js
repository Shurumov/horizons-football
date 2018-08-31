import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class AppContainer extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			tournaments: [{}],
			stages: [
				{
					date: null
				}
			],
			selectedStage: '',
			groups: [
				{
					date: null
				}
			],
			selectedGroup: '',
			teams:[{
				
			}],
			matches: [],
			selectedTeams: []
		};
	}

	setSelectedGroup = (item) => {
		const indexGroup = this.state.groups.findIndex( group => group.stage === item);
		this.setState({
			selectedGroup: this.state.groups[indexGroup].id,
			selectedStage: item
		})
	}

	displayTeamsInGroup = (selectedGroup, teams, matches) => {
		const {groups} = this.state;
		const indexGroup = groups.findIndex( group => group.id === selectedGroup);
		const selectedTeamIds = groups[indexGroup].teams;
		let selectedTeams=[];
		selectedTeamIds.forEach( item => {
			const indexTeam = teams.findIndex( team => team.id === item);
			selectedTeams.push(teams[indexTeam])
		})

		const matchesGroup = matches.filter( item => item.group == this.state.selectedGroup)
		

		this.setState({
			selectedTeams: selectedTeams
		});

		this.calculationPoints(matchesGroup, selectedTeams);
	}

	calculationPoints = (matches, selectedTeams) => {
		const scoreWin = 3;
		const scoreDraw = 1;

		matches.map(item => {
			const score = item.score.split(':');
			console.log(selectedTeams)
			
			const indexTeam1 = selectedTeams.findIndex( team => team.id == item.team1);
			
			selectedTeams[indexTeam1].goals += +score[0];
			selectedTeams[indexTeam1].falls += +score[1];
			selectedTeams[indexTeam1].games++;

			const indexTeam2 = selectedTeams.findIndex( team => team.id == item.team2);
			
			selectedTeams[indexTeam2].goals += +score[1];
			selectedTeams[indexTeam2].falls += +score[0];
			selectedTeams[indexTeam2].games++;

			if (score[0] == score[1]){
				selectedTeams[indexTeam1].score += scoreDraw
				selectedTeams[indexTeam2].score += scoreDraw
			} else if (score[0] > score[1])
			{
				selectedTeams[indexTeam1].score += scoreWin
			} else {
				selectedTeams[indexTeam2].score += scoreWin
			}

		})
	}



	componentDidMount() {

		function loginByToken(baseUrl, projectName, refreshToken) {
			var xhr = new XMLHttpRequest();
			var url = baseUrl + projectName + "/login/byToken";
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
		
		
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText)
					const session = response.sessionId;
					getTournament(baseUrl, projectName, session, refreshToken)
				}
			};
			xhr.send('"' + refreshToken + '"');
		}

		function getTournament (baseUrl, projectName, session, refreshToken) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/Tournaments?include=['title','description']");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					loginByToken(baseUrl, projectName, refreshToken);
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const tournaments = response;
					addTournamentToState(tournaments, appContainer);
					getStages(baseUrl, projectName, session);
				}
			}
		}	

		function addTournamentToState(tournaments, appContainer){
			appContainer.setState({
				tournaments: tournaments
			})
		}
		
		function getStages(baseUrl, projectName, session){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/Stages?include=['title','date','id']");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const stages = response;
					addStagesToState(stages, appContainer);
					getGroups(baseUrl, projectName, session);
				}
			}
		}

		function addStagesToState(stages, appContainer){
			appContainer.setState({
				stages: stages,
				selectedStage: stages[0].id
			})
		}

		function getGroups(baseUrl, projectName, session){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/GroupsFootball?include=['title','stage','teams','id']");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const groups = response;
					addGroupsToState(groups, appContainer);
					getTeams(baseUrl, projectName, session)
				}
			}
		}

		function addGroupsToState(groups, appContainer){
			appContainer.setState({
				groups: groups,
				selectedGroup: groups[0].id
			})
		}

		function getTeams(baseUrl, projectName, session){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/footballTeam?include=['id','title','symbol']");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const teams = response;
					addTeamsToState(teams, appContainer);
					getMatches(baseUrl, projectName, session)
				}
			}
		}

		function addTeamsToState(teams, appContainer){

			teams.forEach(item =>{
				item.goals = 0;
				item.falls = 0;
				item.score = 0;
				item.games = 0;
			})
			appContainer.setState({
				teams: teams
			})
		}

		function getMatches(baseUrl, projectName, session){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/GamesFooball?include=['stage','group','team1','team2','score']");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					let matches = response;
					const teams = appContainer.state.teams;

					matches.forEach(match => {
						const indexTeam1 = teams.findIndex( team => team.id === match.team1);
						match.team1Title = teams[indexTeam1].title;
						match.symbol1 = teams[indexTeam1].symbol

						const indexTeam2 = teams.findIndex( team => team.id === match.team2);
						match.team2Title = teams[indexTeam2].title;
						match.symbol2 = teams[indexTeam2].symbol
					})
					addMatchesToState(matches, appContainer);
				}
			}
		}

		function addMatchesToState(matches, appContainer){
			appContainer.setState({
				matches: matches
			})
		}

		

		const { baseUrl, projectName, refreshToken} = this.props;
		this.setState({
			session: this.props.session
		})
		const session = this.props.session;
		const appContainer = this;
		getTournament (baseUrl, projectName, session, refreshToken);
	}

	render(){
		return <App tournament = {this.state.tournaments} 
								stages = { this.state.stages } 
								groups = { this.state.groups }
								teams = { this.state.teams }
								matches = { this.state.matches }
								selectedTeams ={this.state.selectedTeams}
								setSelectedGroup = { this.setSelectedGroup }
								displayTeamsInGroup = {this.displayTeamsInGroup}
								app = {this}/>
	}
}

const App = (props) => {
	const {tournament, stages, groups, teams, matches, setSelectedGroup, selectedTeams, app} = props;

	return(
		<div>
			<header className="tournament-header">
				<div className="clearfix">
					<TournamentInfo title={tournament[0].title} description={tournament[0].description}/>
					<StageInfo stages = { stages } setSelectedGroup = { setSelectedGroup } app = { app } />
				</div>	
				<div className="block-separator"></div>
			</header>
			<main>
					<TournamentGroupMenu groups = { groups } teams = { teams } matches = { matches } app={ app }/>
					<TournamentGroupTable selectedTeams = { selectedTeams }  />
					<div className="block-separator"></div>
					<TournamentMatchesTable matches = { matches } app={ app }/>
			</main>
		</div>
	)
}

const TournamentInfo = (props) => {
	const {title, description} = props;
	const descriptionHTML = (description);
	
	return (
		<div className="tournament-header-desc">
			<div className="tournament-header-title">{title}</div>
			<div dangerouslySetInnerHTML={{__html:descriptionHTML}}/>
			
    </div>
	)
}

const StageInfo = (props) => {
	const {stages, setSelectedGroup,  app} = props;
	return(
		<div className="tournament-header-meta">
				<ListStages	stages = { stages }
										setSelectedGroup = { setSelectedGroup } 
										app = { app }/>
				<DateStage	app = { app } />
			
		</div>
	)
}

const ListStages = ( props ) => {
	const {stages, setSelectedGroup, app} = props;
	const stagesList = stages.map((item, index) => (
		<option key={index} 
						value = { item.id } 
						onClick = {() => setSelectedGroup(item.id) } >
						
							{item.title}
		</option>
	))


	return(
		<div className="tournament-header-meta-stage">
			<div className="custom-select">
				<select name="stage" 
								onChange = {event => setSelectedGroup(event.target.value)}
								value={app.state.selectedStage}>
					{stagesList}
				</select>
			</div>
		</div>
	)
}

const DateStage = (props) => {
	const { app } = props;
	const { selectedStage, stages } = app.state;
	const indexDateStage = stages.findIndex( item => item.id === selectedStage );

	return(
		<div className="tournament-header-meta-date">
			{indexDateStage !== -1 ? stages[indexDateStage].date : null}
		</div>
	)
}

const TournamentGroupMenu = (props) => {
	const {app, groups, teams, matches } = props;
	const {selectedGroup, selectedStage} = app.state;
	let groupsList = groups.filter( item => {
		if(item.stage === selectedStage)
		return item;
	})
	groupsList = groupsList.map((item, index) => (
		<li className={ selectedGroup == item.id ? 
										"tournament-group-menu-list-item active" : 
										"tournament-group-menu-list-item"} 
				key={ index } 
				onClick = { () => app.displayTeamsInGroup(item.id, teams, matches) }>
			<a href="#" onClick = {() => app.setState({ selectedGroup: item.id })}>
				{item.title}
			</a>
		</li>) 
	);

	return (
		<div className="tournament-group-menu">
        <div className="tournament-group-menu-list-wrapper">
            <ul className="tournament-group-menu-list">
                {groupsList}
            </ul>
        </div>
    </div>
	)
}

const TournamentGroupTable = (props) => {
		const { selectedTeams } = props;

		const teamsRows = selectedTeams.map((item, index) =>{
			return (
				<tr key={index}>
            <td className="tournament-group-table-num text-center text-gray">{index+1}</td>
            <td className="tournament-group-table-logo"><img src={item.symbol} alt={item.title} /></td>
            <td>{item.title} </td>
            <td className="text-center text-gray">{item.games}</td>
            <td className="text-center text-gray">{item.score}</td>
            <td className="text-center text-gray">{item.goals}-{item.falls}</td>
        </tr>
			)
		})
		
		return(
			<table className="tournament-group-table" >
			<tbody>
				<tr className="tournament-group-table-heading">
					<th className="tournament-group-table-num"></th>
					<th className="tournament-group-table-logo"></th>
					<th className="text-left">Команда </th>
					<th className="text-center tournament-group-table-score-games">
							<div className="hidden-mobile">Игр</div>
							<div className="visible-mobile">И</div>
					</th>
					<th className="text-center tournament-group-table-score-points">
							<div className="hidden-mobile">Набранные очки</div>
							<div className="visible-mobile">О</div>
					</th>
					<th className="text-center tournament-group-table-score-ratio">
							<div className="hidden-mobile">Соотношение мячей</div>
							<div className="visible-mobile">Мячи</div>
					</th>
        </tr>
				{teamsRows}
				</tbody>
		</table>
		)
	
}


const TournamentMatchesTable = (props) => {

	const {app, matches} = props;
	const matchesGroup = matches.filter( item => item.group == app.state.selectedGroup)
	const matchesGroupRow = matchesGroup.map( (item, index) => (
		<tr key={index}>
			<td className="tournament-matches-table-team-logo">
					<img src={item.symbol1} alt={item.team1Title}/>
			</td>
			<td className="text-right tournament-matches-table-team-name">{item.team1Title}</td>
			<td className="text-center">
					<div className="tournament-matches-table-score">{item.score}</div>
			</td>
			<td className="tournament-matches-table-team-name">{item.team2Title}</td>
			<td className="tournament-matches-table-team-logo text-right">
					<img src={item.symbol2} alt={item.team2Title} />
			</td>
		</tr>
	))
	return(
		<table className="tournament-matches-table">
			<tbody>
				{matchesGroupRow}
			</tbody>
		</table>
	)
}

sessionFromNative('{"sessionId":"5bd5754a-cb59-48eb-b1dc-d26f58ae1209","userId":"1","projectName": "tmk","baseUrl":"https://api.appercode.com/v1/","refreshToken":"d085ab17-320e-4ea7-b832-aed37c58fdd9"}')

function sessionFromNative(e){
	const userData = JSON.parse(e);
  const session = userData.sessionId;
  const userId = userData.userId;
  const projectName = userData.projectName;
  const baseUrl = userData.baseUrl;
	const refreshToken = userData.refreshToken;
	
	ReactDOM.render(<AppContainer 
										session={session} 
										userId={userId}
										baseUrl={baseUrl}
										projectName={projectName}
										refreshToken={refreshToken}
									/>, document.getElementById('root'));
}
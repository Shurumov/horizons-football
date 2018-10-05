import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class AppContainer extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			loading: true,
			tournaments: [{}],
			stages: [
				{
					date: null
				}
			],
			selectedStage: '',
			groups: [
				{
					id: null,
					stage: null,
					teams: null,
					title: null
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

		const { teams, groups } = this.state

		this.displayTeamsInGroup(this.state.groups[indexGroup].id, teams, groups)
	}

	displayTeamsInGroup = (selectedGroup, teams, matches) => {

		this.setState({
			selectedGroup: selectedGroup
		});
		const {groups} = this.state;
		const indexGroup = groups.findIndex( group => group.id === selectedGroup);
		let  selectedTeamIds = [];
		selectedTeamIds = groups[indexGroup].teams;
		let selectedTeams=[];

		if(selectedTeamIds){
			selectedTeamIds.forEach( item => {
				const indexTeam = teams.findIndex( team => team.id === item);
				selectedTeams.push(teams[indexTeam])
			})
		}
		const matchesGroup = matches.filter( item => item.group == selectedGroup)

		selectedTeams.forEach(item => {
			item.goals = 0;
			item.falls = 0;
			item.games = 0;
			item.score = 0;	
			item.diff = 0
		})

		this.calculationPoints(matchesGroup, selectedTeams);

		selectedTeams.sort(this.getTeamsDiff);

		this.setState({
			selectedTeams: selectedTeams
		});
	}

	calculationPoints = (matches, selectedTeams) => {
		const scoreWin = 3;
		const scoreDraw = 1;


		matches.map(item => {
			const score = item.score.split(':');
			

			const indexTeam1 = selectedTeams.findIndex( team => team.id == item.team1);
			
			selectedTeams[indexTeam1].goals += +score[0];
			selectedTeams[indexTeam1].falls += +score[1];
			selectedTeams[indexTeam1].diff += (+score[0] - +score[1]);
			selectedTeams[indexTeam1].games++;

			const indexTeam2 = selectedTeams.findIndex( team => team.id == item.team2);
			
			selectedTeams[indexTeam2].goals += +score[1];
			selectedTeams[indexTeam2].falls += +score[0];
			selectedTeams[indexTeam2].diff += (+score[1] - +score[0]);
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

	getTeamsDiff = (team1, team2) => {

		if (team1.diff > team2.diff)
			return -1;
		if (team1.diff < team2.diff)
			return 1;

		if (team1.goals > team2.goals)
			return -1;
		if (team1.goals > team2.goals)
			return 1;
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
					console.log(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText)
					const session = response.sessionId;
					getTournament(baseUrl, projectName, session, refreshToken, language)
				}
			};
			xhr.send('"' + refreshToken + '"');
		}

		function getTournament (baseUrl, projectName, session, refreshToken, language) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/Tournaments?include=['title','description']&take=-1&order=createdAt");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.setRequestHeader('X-Appercode-Language', language);


			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					loginByToken(baseUrl, projectName, refreshToken);
				} else
				if (xhr.status !== 200) {
					console.log(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const tournaments = response;
					addTournamentToState(tournaments, appContainer);
					getStages(baseUrl, projectName, session, language);
				}
			}
		}	

		function addTournamentToState(tournaments, appContainer){
			appContainer.setState({
				tournaments: tournaments
			})
		}
		
		function getStages(baseUrl, projectName, session, language){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/Stages?include=['title','date','id']&take=-1&order=createdAt");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.setRequestHeader('X-Appercode-Language', language);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					console.log(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const stages = response;
					addStagesToState(stages, appContainer);
					getGroups(baseUrl, projectName, session, language);
				}
			}
		}

		function addStagesToState(stages, appContainer){
			appContainer.setState({
				stages: stages,
				selectedStage: stages[1].id
			})
		}

		function getGroups(baseUrl, projectName, session, language){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/GroupsFootball?include=['title','stage','teams','id']&take=-1&order=createdAt");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.setRequestHeader('X-Appercode-Language', language);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					console.log(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					const groups = response;
					addGroupsToState(groups, appContainer);
					getTeams(baseUrl, projectName, session, language)
				}
			}
		}

		function addGroupsToState(groups, appContainer){
			appContainer.setState({
				groups: groups,
				selectedGroup: groups[4].id
			})
		}

		function getTeams(baseUrl, projectName, session, language){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/footballTeam?include=['id','title','symbol']&take=-1&order=createdAt");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.setRequestHeader('X-Appercode-Language', language);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					console.log(xhr.status + ': ' + xhr.statusText);
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
			xhr.open('GET', baseUrl + projectName + "/objects/GamesFooball?include=['stage','group','team1','team2','score']&take=-1&order=createdAt");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					console.log(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					let matches = response;
					let teams = appContainer.state.teams;
					const { selectedGroup } = appContainer.state

					matches.forEach(match => {
						const indexTeam1 = teams.findIndex( team => team.id === match.team1);
						match.team1Title = teams[indexTeam1].title;
						match.symbol1 = teams[indexTeam1].symbol

						const indexTeam2 = teams.findIndex( team => team.id === match.team2);
						match.team2Title = teams[indexTeam2].title;
						match.symbol2 = teams[indexTeam2].symbol
					})
					addMatchesToState(matches, appContainer); 
					appContainer.displayTeamsInGroup(selectedGroup, teams, matches);
					appContainer.setState({
						loading: false
					})
				}
			}
		}

		function addMatchesToState(matches, appContainer){
			appContainer.setState({
				matches: matches
			})
		}
		const { baseUrl, projectName, refreshToken, language} = this.props;
		this.setState({
			session: this.props.session
		})
		const session = this.props.session;
		const appContainer = this;
		getTournament (baseUrl, projectName, session, refreshToken, language);
	}

	render(){
		
		const { loading } = this.state;

		return (
				<div>
						<App tournament = {this.state.tournaments} 
								stages = { this.state.stages } 
								groups = { this.state.groups }
								teams = { this.state.teams }
								matches = { this.state.matches }
								selectedTeams ={this.state.selectedTeams}
								setSelectedGroup = { this.setSelectedGroup }
								displayTeamsInGroup = {this.displayTeamsInGroup}
								app = {this}/>
								{loading ? <LoadAnimation /> : null}
				</div>
		)
	}
}

const LoadAnimation = () => {
	return(
		<div className="loader_background">
			<div className="loader"></div>
		</div>
	)
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
					<TournamentGroupTable selectedTeams = { selectedTeams } app = { app } />
					<div className="block-separator"></div>
					<TournamentMatchesTable matches = { matches } app={ app }/>
			</main>
			<Footer app = {app} />
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
			<div >
				{item.title}
			</div>
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
		const { selectedTeams, app } = props;
		const { language } = app.props;

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
					<th className="text-left"> {language == "en" ? "Team" : "Команда"} </th>
					<th className="text-center tournament-group-table-score-games">
							<div className="hidden-mobile">{language == "en" ? "Games" : "Игр"}</div>
							<div className="visible-mobile">{language == "en" ? "G" : "И"}</div>
					</th>
					<th className="text-center tournament-group-table-score-points">
							<div className="hidden-mobile">{language == "en" ? "Points earned" : "Набранные очки"}</div>
							<div className="visible-mobile">{language == "en" ? "P" : "О"}</div>
					</th>
					<th className="text-center tournament-group-table-score-ratio">
							<div className="hidden-mobile">{language == "en" ? "Balls" : "Соотношенеи мячей"}</div>
							<div className="visible-mobile">{language == "en" ? "B" : "М"}</div>
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

const Footer = (props) => {
	const { app } = props;
	const { language } = app.props
	const appPlatform = app.props.appPlatform;
	var appercode;
	return (
    <div>
      {appPlatform ? (
        <div className="fixed-footer" onClick={() => document.location.reload()}>
					{ language == "en" ? "Refresh" : "Обновить" }
					
				</div>
      ) : (
        <div className="fixed-footer" onClick={() => appercode.reloadPage()}>
					{ language == "en" ? "Refresh" : "Обновить" }
				</div>
      )}
    </div>
  );

}

function sessionFromNative(e){
	const userData = JSON.parse(e);
  const session = userData.sessionId;
  const userId = userData.userId;
  const projectName = userData.projectName;
  const baseUrl = userData.baseUrl;
	const refreshToken = userData.refreshToken;
	const appPlatform = (userData.appPlatform == "iOS");
	const language = userData.language;
	
	ReactDOM.render(<AppContainer 
										session={session} 
										userId={userId}
										baseUrl={baseUrl}
										projectName={projectName}
										refreshToken={refreshToken}
										appPlatform = { appPlatform }
										language = { language }
									/>, document.getElementById('root'));
}

window.sessionFromNative = sessionFromNative;



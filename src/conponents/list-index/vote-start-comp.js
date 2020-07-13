import React from 'react';
const star_icon = 'fa fa-star';
const star_o_half_icon = 'fa fa-star-half-o';
const star_o_icon = 'fa fa-star-o';

class VoteStarComp extends React.Component {
	constructor() {
		super();
		this.state = {
			star_1: star_o_icon,
			star_2: star_o_icon,
			star_3: star_o_icon,
			star_4: star_o_icon,
			star_5: star_o_icon
		};
	}

	calcVote (rateNumber) {
		if (!rateNumber || rateNumber <= 0) return;
		if ((0 < rateNumber) &&  (rateNumber < 1)) { 
			this.setState({ star_1: star_o_half_icon });
			return;
		}
		this.setState({ star_1: star_icon });
		if (rateNumber <= 1) return;
		if ((1 < rateNumber) && (rateNumber < 2)) { 
			this.setState({ star_2: star_o_half_icon });
			return;
		}
		this.setState({ star_2: star_icon });
		if (rateNumber <= 2) return;
		if ((2 < rateNumber) && (rateNumber < 3)) { 
			this.setState({ star_3: star_o_half_icon });
			return;
		}
		this.setState({ star_3: star_icon });
		if (rateNumber <= 3) return;
		if ((3 < rateNumber) && (rateNumber < 4)) { 
			this.setState({ star_4: star_o_half_icon });
			return;
		}
		this.setState({ star_4: star_icon });
		if (rateNumber <= 4) return;
		if ((4 < rateNumber) && (rateNumber < 5)) { 
			this.setState({ star_5: star_o_half_icon });
			return;
		}
		this.setState({ star_5: star_icon });
	};

	componentDidMount() {
		this.calcVote(this.props.rating);
	}

	render() {
		return (
			<React.Fragment>
				<i className={this.state.star_1}></i><i className={this.state.star_2}></i><i className={this.state.star_3}></i><i className={this.state.star_4}></i><i className={this.state.star_5}></i>
			</React.Fragment>
		);
	}
}

export default VoteStarComp;

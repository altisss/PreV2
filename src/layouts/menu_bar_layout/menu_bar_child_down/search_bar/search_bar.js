import React from "react";

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: "",
            data: [],
            filteredData: []
          }
          this.handleInputChange = this.handleInputChange.bind(this)

    }
  
    handleInputChange = event => {
      const query = event.target.value;
  
      this.setState(prevState => {
        const filteredData = prevState.data.filter(element => {
          return element.name.toLowerCase().includes(query.toLowerCase());
        });
  
        return {
          query,
          filteredData
        };
      });
    };
  
    getData = () => {
        console.log('data')
    };
  
    componentWillMount() {
      this.getData();
    }
  
    render() {
      return (
        <>
          <form>
            <input
              placeholder="Search for..."
              value={this.state.query}
              onChange={this.handleInputChange}
            />
          </form>
          <div>{this.state.filteredData.map(i => <p>{i.name}</p>)}</div>
        </>
      );
    }
  }
export default SearchBar
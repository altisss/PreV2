import React from "react";
import ReactTable from "react-table";

class TableData extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      columns: this.props.columns,
      height: 154
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.state.data.length !== newProps.data.length) {
      this.setState({ data: newProps.data });
    }
    this.setState({ columns: newProps.columns });
    if (this.state.height !== newProps.height) {
      this.setState({ height: newProps.height });
    }
  }

  render() {
    return (
        <ReactTable
          data={this.state.data}
          columns={this.state.columns}
          resizable={false}
          pageSize={this.state.data.length < 2 ? 1 : this.state.data.length}
          showPagination={false}
          style={{
            minWidth: 1265
          }}
          NoDataComponent={() => {
            return (
              <div className="rt-noData hideClass">
                {this.props.t("common_NoDataFound")}
              </div>
            );
          }}
          className="-striped -highlight"
        />
    );
  }
}

export default TableData;

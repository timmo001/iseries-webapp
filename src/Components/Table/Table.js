import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import {
  GroupingState,
  IntegratedFiltering,
  IntegratedGrouping,
  IntegratedPaging,
  IntegratedSorting,
  PagingState,
  SearchState,
  SortingState
} from '@devexpress/dx-react-grid';
import {
  ColumnChooser,
  DragDropProvider,
  Grid,
  GroupingPanel,
  PagingPanel,
  SearchPanel,
  TableColumnReordering,
  TableColumnVisibility,
  TableGroupRow,
  TableHeaderRow,
  Toolbar,
  VirtualTable
} from '@devexpress/dx-react-grid-material-ui';
import FileDocumentIcon from '@material-ui/icons/FileCopy';

const styles = theme => ({
  tableContainer: {
    height: '100%'
  },
  table: {
    height: '100%'
  },
  export: {
    position: 'fixed',
    bottom: theme.spacing.unit * 1.4,
    right: theme.spacing.unit * 1.4
  }
});

class EnhancedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 20, 0],
      data: props.data,
      selection: [],
      loading: props.loading,
    };
    this.changeColumnOrder = this.changeColumnOrder.bind(this);
    this.changeGrouping = this.changeGrouping.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
    this.exportToCSV = this.exportToCSV.bind(this);
  }

  componentDidUpdate = prevProps => {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data });
    }
  };

  changeColumnOrder = newOrder => this.setState({ columnOrder: newOrder });
  changeGrouping = grouping => this.setState({ grouping });
  changeCurrentPage = currentPage => this.setState({ currentPage });
  changePageSize = pageSize => this.setState({ pageSize });

  exportToCSV = () => {
    const header = [];
    this.props.columns.map(c => header.push(c.title));
    const records = [header, ...this.state.data.map(obj => {
      const arr = Array(header.length).fill('');
      Object.keys(obj).map(key => {
        const i = this.props.columns.findIndex(c => c.name === key);
        if (i > -1) arr[i] = (obj[key]);
        return key;
      });
      return arr;
    })];
    console.log(records);
    let csvContent = "data:text/csv;charset=utf-8,";
    records.map(row => csvContent += `"${row.join('","')}"\r\n`);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    console.log(encodedUri);
    link.setAttribute('download', 'export.csv');
    document.body.appendChild(link);
    link.click();
  };

  render() {
    const { classes, columns } = this.props;
    const {
      data, grouping, currentPage,
      pageSize, tableColumnExtensions, pageSizes,
      columnOrder
    } = this.state;

    return (
      <div className={classes.tableContainer}>
        {data ?
          <Grid className={classes.table} rows={data} columns={columns}>
            <DragDropProvider />
            <SortingState defaultSorting={[{ columnName: 'id', direction: 'asc' }]} />
            <GroupingState
              grouping={grouping}
              onGroupingChange={this.changeGrouping} />
            <SearchState />
            <PagingState
              currentPage={currentPage}
              onCurrentPageChange={this.changeCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={this.changePageSize} />
            <IntegratedGrouping />
            <IntegratedSorting />
            <IntegratedFiltering />
            <IntegratedPaging />
            <VirtualTable
              // height="auto"
              columnExtensions={tableColumnExtensions} />
            <TableGroupRow />
            <TableHeaderRow showSortingControls />
            <TableColumnReordering
              order={columnOrder}
              onOrderChange={this.changeColumnOrder} />

            <Button variant="extendedFab" color="primary" aria-label="Add" className={classes.export} onClick={this.exportToCSV}>
              <FileDocumentIcon />
              Export To CSV
            </Button>

            <TableColumnVisibility />
            <Toolbar />
            <SearchPanel />
            <ColumnChooser />

            <GroupingPanel showGroupingControls showSortingControls />
            <PagingPanel pageSizes={pageSizes} />

          </Grid>
          :
          <CircularProgress className="progress" size={50} />
        }
      </div>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  columns: PropTypes.array,
  data: PropTypes.array
};

export default withStyles(styles)(EnhancedTable);
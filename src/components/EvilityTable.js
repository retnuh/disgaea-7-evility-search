import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import LockIcon from '@mui/icons-material/Lock';
import TablePagination from '@mui/material/TablePagination';
import TablePaginationActions from './TablePaginationActions';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: 'lightblue',
  }
}));

const PaginationBox = styled(Box)`
  display: flex;
`;

const EvilityTable = ({
    evilities, textFilter, filters, searches,
    addEvilityToBuild, building, fixed,
    showNumbers
  }) => {
    const [filteredEvilities, setFilteredEvilities] = useState([]);
    const [noTextFilterEvilities, setNoTextFilterEvilities] = useState([]);
    const pageOptions = [
      { label: '30', value: 30 },
      { label: '50', value: 50 },
      { label: '70', value: 70 },
      { label: 'All', value: -1 }
    ];
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(pageOptions[0].value);
    const [tableSize, setTableSize] = useState(0); // because lazy
    const [lastTableSize, setLastTableSize] = useState(0);

    useEffect(() => {
      const rpp = localStorage.getItem('d7-rpp') || rowsPerPage;
      if (rpp !== rowsPerPage) {
        const int = parseInt(rpp, 10);
        if (!isNaN(int)) {
          setRowsPerPage(int);
        }
      }
    }, []);

    useEffect(() => {
      let tempFilteredEvilities = [ ...evilities ].map(x => {
        return {
          ...x,
          category: x.category || "None"
        };
      });

      if (filters) {
        tempFilteredEvilities = tempFilteredEvilities.filter(x => {
          return (filters.unique || !x.unique) &&
              (filters.generic || x.unique) &&
              (filters.learnable || x.enemyOnly) &&
              (filters.enemy || !x.enemyOnly) &&
              (filters.baseGame || x.dlc) &&
              (filters.dlc || !x.dlc) &&
              filters.categories.includes(x.category) &&
              !x.notInGame;
        });
      }
      setNoTextFilterEvilities(tempFilteredEvilities);

      if (textFilter && textFilter.length > 0) {
        tempFilteredEvilities = tempFilteredEvilities.filter(x => {
          const nameBool = searches.name && x.name.toLowerCase().includes(textFilter.toLowerCase());
          const descBool = searches.description && x.description.toLowerCase().includes(textFilter.toLowerCase());
          const sourceBool = searches.source && x.unlock.toLowerCase().includes(textFilter.toLowerCase());

          return nameBool || descBool || sourceBool;
        });
      }

      setFilteredEvilities(tempFilteredEvilities);
    }, [filters]);

    useEffect(() => {
      setTableSize(filteredEvilities.length);
    }, [filteredEvilities]);

    useEffect(() => {
      if (tableSize !== lastTableSize) {
        setPage(0);
        setLastTableSize(filteredEvilities.length);
      }
    }, [tableSize]);

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
      const rpp = parseInt(event.target.value, 10);
      setRowsPerPage(rpp);
      setPage(0);
      localStorage.setItem('d7-rpp', rpp);
    };

    // returns the list number of the evility, where the
    // list is either the list of all generic or all unique evilities
    // in-game (with appropriate filters applied)
    const getListNumber = evility => {
      const list = [...noTextFilterEvilities].filter(x => evility.unique === x.unique && !x.fixed &&
        !x.enemyOnly);
      for (let i = 0; i < list.length; i++) {
        const ev = list[i];
        if (ev.id === evility.id) {
          return i + 1;
        }
      }

      return 0;
    };

    const style = {
      fontWeight: 'bold'
    };

    const enemyOnlyStyle = {
      color: 'purple'
    };

    const dlcStyle = {
      fontStyle: 'italic',
    };

    const flex = building ? '1 0 55%' : '1';

    const numberExplanation = "Number displayed in your evility list (assuming you have all evilities unlocked on the character)";

    return (
      <Paper id="main1" style={{ margin: "1em", flex, order: '1', overflow: 'auto', height: 'fit-content' }}>
        <TableContainer sx={{ maxHeight: "69vh", overflowY: "auto", width: '100%' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {showNumbers && <StyledTableCell align="center" sx={{ width: '1em' }} title={numberExplanation}>
                  No.
                </StyledTableCell>}
                <StyledTableCell sx={{ width: '12em' }}>Name</StyledTableCell>
                <StyledTableCell align="center">Category</StyledTableCell>
                <StyledTableCell align="left">Description</StyledTableCell>
                <StyledTableCell align="center">Cost</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Source</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0 ? filteredEvilities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredEvilities)
                .map(evility => {
                  const listNumber = getListNumber(evility);
                  let nameStyle = { ...style };
                  let rowStyle = {};
                  if (evility.enemyOnly) {
                      nameStyle = { ...nameStyle, ...enemyOnlyStyle };
                      rowStyle = { ...rowStyle, ...{ backgroundColor: '#8000802e !important' } };
                  } else {
                    rowStyle = { ...rowStyle, ...{ '&:last-child td, &:last-child th': { border: 0 } } };
                  }

                  if (evility.dlc) {
                      nameStyle = { ...nameStyle, ...dlcStyle };
                  }

                  if (evility.fixed) {
                    nameStyle = { ...nameStyle, position: 'relative' };
                  }

                  let cantAdd = false;
                  if (fixed && building && fixed !== "Prinny" &&
                    evility.fixed && evility.fixed !== fixed) {
                    cantAdd = true;
                    rowStyle = { ...rowStyle, textDecoration: 'line-through', opacity: '0.5' };
                  }

                  if (fixed && building && fixed !== "Prinny" &&
                    evility.fixed && evility.fixed === fixed) {
                      rowStyle = { ...rowStyle, backgroundColor: 'lightyellow !important', outline: '2px dotted yellow' };
                    }

                  const typeStyle = evility.unique ? { fontWeight: "bold", textDecoration: "underline" } : {};
                  const title = evility.fixed ? `Exclusive to ${evility.fixed}` : '';

                  return <StyledTableRow
                    key={evility.id || evility.name}
                    title={evility.notes}
                    sx={rowStyle}
                    onClick={() => !cantAdd && addEvilityToBuild(evility)}
                  >
                    {showNumbers && <StyledTableCell align="center">
                      {listNumber || '-'}
                    </StyledTableCell>}
                    <StyledTableCell component="th" scope="row" sx={ nameStyle } title={title}>
                      {evility.name}{evility.fixed && <LockIcon
                        sx={{ width: '15px', cursor: 'pointer', verticalAlign: 'middle', marginTop: '-2px',
                          color: 'blue', marginLeft: '4px' }} />}{evility.notScrollable && <img
                            style={{ transform: 'translateY(3px)', marginLeft: '4px', cursor: 'pointer', width: '15px' }}
                            title={"Can't be turned into a scroll"} src={`images/NoScroll.png`} />}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ lineHeight: 0 }}><img title={evility.category}
                      src={`images/evility_categories/${evility.category || "None"}.png`} />
                    </StyledTableCell>
                    <StyledTableCell align="left">{evility.description}</StyledTableCell>
                    <StyledTableCell align="center">{evility.cost ? evility.cost : '-'}</StyledTableCell>
                    <StyledTableCell align="left" sx={ typeStyle }>{evility.unique ? "Unique" : "Generic"}</StyledTableCell>
                    <StyledTableCell align="left">{evility.unlock}</StyledTableCell>
                  </StyledTableRow>;
              }

              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
            component={PaginationBox}
            rowsPerPageOptions={pageOptions}
            colSpan={3}
            count={filteredEvilities.length}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage="" // ideally add words if screen wide enough
            page={page}
            SelectProps={{
              inputProps: {
                'aria-label': 'rows per page',
              },
              native: true,
              sx: { marginRight: '1em', marginLeft: '0em' },
              title: "Rows Per Page"
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
        />
      </Paper>
    );
};

EvilityTable.propTypes = {
  addEvilityToBuild: PropTypes.func.isRequired,
  evilities: PropTypes.array.isRequired,
  textFilter: PropTypes.string,
  filters: PropTypes.object,
  searches: PropTypes.object,
  building: PropTypes.bool,
  fixed: PropTypes.string,
  showNumbers: PropTypes.bool
};
export default EvilityTable;

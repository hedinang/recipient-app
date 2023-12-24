import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  gridContainer: {
    fontFamily: 'AvenirNext',
  },
  imagePreferred: {
    cursor: 'pointer',
  },
  selectImgPreferred: {
    border: 'solid 1.5px #76c520',
  },
  notSelectImgPreferred: {
    filter: 'opacity(0.7)',
  },
  button: {
    borderRadius: 40,
    textTransform: 'initial',
    borderWidth: 2,
    fontWeight: 600,
    boxShadow: 'none',
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    '&:hover': {
      borderWidth: 2,
    },
  },
  dialogButton: {
    textTransform: 'uppercase',
    minWidth: 130,
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 110,
    },
  },
  itemCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootButton: {
    borderRadius: 24,
    border: '1px solid #4a4a4a',
    marginBottom: 32,
  },
  buttonLabel: {
    textTransform: 'none',
    paddingLeft: 20,
    paddingRight: 20,
  }
}))

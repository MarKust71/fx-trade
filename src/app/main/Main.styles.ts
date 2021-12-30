import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.paper,
  },
}));

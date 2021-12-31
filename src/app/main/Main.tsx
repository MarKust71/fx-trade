import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';

import { MainProps } from './Main.types';
import { useStyles } from './Main.styles';

interface IMessage {
  command?: string;
  arguments?: {
    userId?: number;
    password?: string;
    symbol?: string;
  };
  streamSessionId?: string;
  symbol?: string;
}

interface ISendArgs {
  ws: WebSocket;
  message: IMessage;
}

type TSymbol = {
  ask: number;
  bid: number;
  categoryName: string;
  contractSize: number;
  currency: string;
  currencyPair: boolean;
  currencyProfit: string;
  description: string;
  expiration: string | null;
  groupName: string;
  high: number;
  initialMargin: number;
  instantMaxVolume: number;
  leverage: number;
  longOnly: boolean;
  lotMax: number;
  lotMin: number;
  lotStep: number;
  low: number;
  marginHedged: number;
  marginHedgedStrong: boolean;
  marginMaintenance: null;
  marginMode: number;
  percentage: number;
  precision: number;
  profitMode: number;
  quoteId: number;
  shortSelling: boolean;
  spreadRaw: number;
  spreadTable: number;
  starting: null;
  stepRuleId: number;
  stopsLevel: number;
  swap_rollover3days: number;
  swapEnable: boolean;
  swapLong: number;
  swapShort: number;
  swapType: number;
  symbol: string;
  tickSize: number;
  tickValue: number;
  time: number;
  timeString: string;
  trailingEnabled: boolean;
  type: number;
};

const send = ({ ws, message }: ISendArgs) => {
  try {
    const jsonMessage = JSON.stringify(message);
    ws.send(jsonMessage);
    console.log('Sent ' + jsonMessage.length + ' bytes of data: ' + jsonMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error while sending data: ' + error.message);
      disconnect(ws);
    }
  }
};

const login = ({ ws, userId, password }: { ws: WebSocket; userId: string; password: string }): void => {
  const message: IMessage = {};
  message.command = 'login';
  message.arguments = {
    userId: parseInt(userId),
    password,
  };
  console.log('Trying to log in as: ' + message.arguments.userId);
  send({ ws, message });
};

const getAllSymbols = ({ ws }: { ws: WebSocket }) => {
  const message: IMessage = {};
  message.command = 'getAllSymbols';
  console.log('Getting list of symbols');
  send({ ws, message });
};

const connect = ({
  userId,
  password,
  handleMessage,
}: {
  userId: string;
  password: string;
  handleMessage: (event: MessageEvent) => void;
}): WebSocket => {
  const url = process.env.REACT_APP_URL || '';
  console.log('Connecting to: ' + url);
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('Connected');
    login({ ws, userId, password });
  };

  ws.onerror = () => {
    console.log('Connection error');
  };

  /*
  ws.onmessage = (evt) => {
    console.log('Received: ' + evt.data);

    try {
      const response = JSON.parse(evt.data);
      if (response.status) {
        if (response.streamSessionId) {
          // We received login response
          getAllSymbols({ ws });
        } else {
          // We received getAllSymbols response
          // parseGetAllSymbols(response.returnData);
        }
      } else {
        alert('Error: ' + response.errorDescr);
      }
    } catch (Exception) {
      alert('Fatal error while receiving data! :(');
    }
  };
*/

  ws.onmessage = handleMessage;

  ws.onclose = () => {
    console.log('Connection closed');
  };

  return ws;
};

const disconnect = (ws: WebSocket) => {
  if (ws) ws.close();
};

export const Main: React.FC<MainProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const [userId, setUserId] = useState(process.env.REACT_APP_USERID || '');
  const [password, setPassword] = useState(process.env.REACT_APP_PASSWORD || '');
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const [sessionId, setSessionId] = useState('');
  const [symbols, setSymbols] = useState<TSymbol[] | [] | TSymbol>([]);
  const [categories, setCategories] = useState<Set<string> | []>([]);

  const handleConnect = () => {
    if (userId && password) {
      const response = connect({ handleMessage, userId, password });
      setWs(response);
    } else {
      console.log('empty name or password');
    }
  };

  const handleDisconnect = () => {
    if (ws) {
      disconnect(ws);
      setWs(undefined);
      setSessionId('');
    }
  };

  const handleClick = useMemo(() => {
    return ws ? handleDisconnect : handleConnect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws]);

  const handleMessage = (event: MessageEvent) => {
    try {
      const response = JSON.parse(event.data);
      if (response.status) {
        if (response.streamSessionId) {
          // We received login response
          setSessionId(response.streamSessionId);
          console.log('Logged in: ', response);
        } else {
          // We received getAllSymbols response
          // parseGetAllSymbols(response.returnData);
          /*
          console.log(
            'Received: ',
            response.returnData
              .filter((item: TSymbol) => item.categoryName === 'FX')
              .map((item: TSymbol) => ({ categoryName: item.categoryName, symbol: item.symbol })),
          );
*/
          console.log('Received: ', response.returnData);
          setSymbols(response.returnData);
        }
      } else {
        alert('Error: ' + response.errorDescr);
      }
    } catch (Exception) {
      alert('Fatal error while receiving data! :(');
    }
  };

  const getCandles = ({ symbol }: { symbol: string }) => {
    /*
    const message = {
      command: 'getCandles',
      streamSessionId: sessionId,
      symbol,
    };
*/
    /*
    const message = {
      command: 'getBalance',
      streamSessionId: sessionId,
    };
*/
    /*
    const message = {
      command: 'getSymbol',
      arguments: {
        symbol: 'DE30',
      },
    };
*/
    const message = {
      command: 'getVersion',
    };
    if (ws) send({ ws, message });
  };

  useEffect(() => {
    if (sessionId && ws) getAllSymbols({ ws });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (Array.isArray(symbols)) {
      if (symbols.length)
        console.log(
          'Received:',
          symbols.filter((symbol) => symbol.categoryName === 'IND'),
        );
      const categorySet: Set<string> = new Set();
      symbols.map((symbol) => categorySet.add(symbol.categoryName));
      setCategories(categorySet);
    }
  }, [symbols]);

  useEffect(() => {
    console.log('categories:', categories);
  }, [categories]);

  return (
    <Box p={2} sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography className={classes.wrapper}>My React Typescript Material-UI Boilerplate</Typography>
      <Box mb={2} />
      <TextField label="Name" value={userId} onChange={({ target }) => setUserId(target.value)} />
      <Box mb={2} />
      <TextField
        type="password"
        label="Password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <Box mb={2} />
      <Box mb={2}>
        <Button variant="contained" onClick={handleClick} sx={{ width: 'auto' }}>
          {ws ? 'Disconnect' : 'Connect'}
        </Button>
      </Box>
      {ws && (
        <Box>
          <Button variant="contained" onClick={() => getCandles({ symbol: 'DE30' })}>
            DE.30
          </Button>
        </Box>
      )}
    </Box>
  );
};

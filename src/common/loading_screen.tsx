import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

type Props = {
  maxCount?: number;
};

export default function LoadingScreen({ maxCount }: Props) {
  const [msgCount, setMsgCount] = React.useState(0);

  React.useEffect(() => {
    if (maxCount! > 0) {
      const handle = setTimeout(() => setMsgCount(msgCount === maxCount ? 0 : msgCount + 1), 500);
      return () => clearTimeout(handle);
    } else {
      return () => {};
    }
  }, [msgCount, maxCount]);

  return (
    <Stack
      direction="column"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100px',
        transform: 'translate(-50%, -50%)',
        alignItems: 'center',
      }}
    >
      <CircularProgress size="100%" style={{ color: '#50C878' }} />
      <h2
        style={{
          textAlign: 'center',
          fontFamily: 'Raleway',
        }}
      >Hitching{'.'.repeat(msgCount)}
      </h2>
    </Stack>
  );
}

LoadingScreen.defaultProps = {
  maxCount: 5,
};

import styles from "./app.module.scss";
import { Flex } from "monday-ui-react-core";
function App() {
  return (
    <Flex className={styles.app}>
      <iframe
        width={"100%"}
        height={"100%"}
        src={`https://sites.research.google/floods/l/0/0/3?origin=${window.location.origin}`}
      />
    </Flex>
  );
}

export default App;

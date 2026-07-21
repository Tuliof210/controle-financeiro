import { useHomePage } from "./hook";
import styles from "./style.module.scss";

export function HomePage() {
  const { message } = useHomePage();

  return <div className={styles.message}>{message}</div>;
}

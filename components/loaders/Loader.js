import styles from "./loader.module.css"

const Loader = () => {
  return (
    <div className={styles.loader}>
      <svg viewBox="0 0 80 80">
        <circle r="32" cy="40" cx="40" id="test"></circle>
      </svg>
    </div>
  )
}

export default Loader
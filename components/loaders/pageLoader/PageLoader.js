import styles from "./pageLoader.module.css"

const PageLoader = () => {
  return (
    <div className={styles.loader}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default PageLoader
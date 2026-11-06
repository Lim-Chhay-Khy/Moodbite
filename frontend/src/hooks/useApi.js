import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------
// A small custom hook that runs an API call and tracks its state, so
// every page doesn't need to repeat the same useState + useEffect code.
//
//   const { data, loading, error, retry } = useApi(() => getRecipe(id), [id])
//
//   loadData      a function that returns a Promise (an apiService call)
//   dependencies  re-run the call when any of these values change
//   retry()       runs the call again (for a "Try Again" button)
// ---------------------------------------------------------------------
export default function useApi(loadData, dependencies) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // changing this re-runs the effect

  useEffect(() => {
    // If the user leaves the page (or the inputs change) before the
    // answer arrives, `ignore` stops an old answer from replacing a new one.
    let ignore = false

    setLoading(true)
    setError(null)

    loadData()
      .then((result) => {
        if (!ignore) setData(result)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, attempt])

  function retry() {
    setAttempt((count) => count + 1)
  }

  return { data, loading, error, retry }
}

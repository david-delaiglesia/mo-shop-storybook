import { useEffect, useRef } from 'react'

import { object } from 'prop-types'

const SCAChallenge = ({ paymentParams }) => {
  const { URL_Base: urlBase, ...restOfParams } = paymentParams
  const formRef = useRef(null)

  useEffect(() => {
    if (!formRef.current) return
    formRef.current.submit()
  }, [formRef])

  return (
    <form
      ref={formRef}
      name="redsys"
      action={urlBase}
      method="POST"
      data-testid="sca-form"
    >
      {Object.entries(restOfParams).map(([paramName, paramValue]) => (
        <input
          key={paramName}
          type="hidden"
          name={paramName}
          value={paramValue}
        />
      ))}
    </form>
  )
}

SCAChallenge.propTypes = {
  paymentParams: object.isRequired,
}

export { SCAChallenge }

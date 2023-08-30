import React from 'react'
import { useTranslation } from 'react-i18next'

import type { Props } from './types.js'

import useField from '../../../useField/index.js'
import './index.scss'

const baseClass = 'section-title'

const SectionTitle: React.FC<Props> = (props) => {
  const { path, readOnly } = props

  const { setValue, value } = useField({ path })
  const { t } = useTranslation('general')

  const classes = [baseClass].filter(Boolean).join(' ')

  return (
    <div className={classes} data-value={value}>
      <input
        onChange={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setValue(e.target.value)
        }}
        className={`${baseClass}__input`}
        id={path}
        name={path}
        placeholder={t('untitled')}
        readOnly={readOnly}
        type="text"
        value={(value as string) || ''}
      />
    </div>
  )
}

export default SectionTitle
import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from './components/Button'
import { useForm } from 'react-hook-form'
import { Input } from './components/Input'
import { InputSelect } from './components/InputSelect'
import axios from 'axios'

// Função para validar número de telefone
const validatePhoneNumber = (phone) => {
  const regex = /^\(\d{2}\) \d \d{4}-\d{4}$/
  return regex.test(phone)
}

async function fetchIPCARateReal() {
  const currentYear = new Date().getFullYear()

  try {
    const url = `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador eq 'IPCA' and DataReferencia ge '${currentYear}' and Data ge '${currentYear}-01-01'&$orderby=Data desc&$top=100`
    const { data } = await axios.get(url)

    const results = {}
    for (const item of data.value) {
      const ano = item.DataReferencia
      const atual = results[ano]

      if (!atual || new Date(item.Data) > new Date(atual.Data)) {
        results[ano] = item
      }
    }

    return results
  } catch (error) {
    console.error('Erro ao buscar IPCA:', error)
  }
}

async function fetchCDIRateReal() {
  const currentYear = new Date().getFullYear()

  try {
    const url = `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador eq 'Selic' and DataReferencia ge '${currentYear}' and Data ge '${currentYear}-01-01'&$orderby=Data desc&$top=100`
    const { data } = await axios.get(url)

    const results = {}
    for (const item of data.value) {
      const ano = item.DataReferencia
      const atual = results[ano]

      if (!atual || new Date(item.Data) > new Date(atual.Data)) {
        results[ano] = {
          ...item,
          Media: parseFloat((item.Media * 0.98).toFixed(3))
        }
      }
    }

    return results
  } catch (error) {
    console.error('Erro ao buscar IPCA:', error)
  }
}

// Função para formatar número de telefone
const formatPhoneNumber = (phone) => {
  phone = phone.replace(/[^\d]+/g, '')
  if (phone.length > 11) phone = phone.slice(0, 11)
  if (phone.length > 6)
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 3)} ${phone.slice(3, 7)}-${phone.slice(7)}`
  if (phone.length > 2) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`
  return phone
}

const formatTaxa = (value) => {
  return value
    .replace(/[^\d,]/g, '') // Remove tudo que não for número ou vírgula
    .replace(/,{2,}/g, ',') // Remove múltiplas vírgulas
    .replace(/^,/, '') // Evita que o primeiro caractere seja uma vírgula
}

const formatMoney = (value) => {
  let cleanValue = value.replace(/\D/g, '') // Remove tudo que não for número

  if (!cleanValue) return '' // Se não houver número, retorna vazio

  let numberValue = (parseFloat(cleanValue) / 100).toFixed(2) // Converte para decimal

  return numberValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// const encode = (data) => {
//   return Object.keys(data)
//     .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
//     .join('&')
// }

const InfoDataSchema = z.object({
  whatsapp: z.string().refine(validatePhoneNumber, {
    message: 'Número de telefone inválido. Use o formato (99) 9 1111-1111'
  }),
  nome: z.string().min(1, 'Campo obrigatório.'),
  email: z.string().min(1, 'Campo obrigatório.'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos'
  })
})

const MoneyDataSchema = z.object({
  aporteInicial: z
    .string()
    .regex(/^\d{1,3}(\.\d{3})*,\d{2}$/, 'Formato inválido. Use R$ 0,00')
    .transform((val) => Number(val.replace(/\./g, '').replace(',', '.'))),
  aporteMensal: z
    .string()
    .regex(/^\d{1,3}(\.\d{3})*,\d{2}$/, 'Formato inválido. Use R$ 0,00')
    .transform((val) => Number(val.replace(/\./g, '').replace(',', '.')))
    .refine((val) => val > 0, {
      message: 'O aporte mensal deve ser maior que zero'
    }),
  taxa: z
    .string()
    .regex(
      /^\d*(,\d{0,2})?$/,
      'A taxa deve ser um número e pode conter uma vírgula'
    )
    .transform((val) => Number(val.replace(/\./g, '').replace(',', '.')))
    .refine((val) => val > 0, {
      message: 'A taxa deve ser maior que zero'
    }),
  periodo: z
    .string()
    .regex(/^\d+$/, 'O período deve ser um número inteiro positivo')
    .transform((val) => Number(val))
    .refine((val) => val > 0, {
      message: 'O período deve ser maior que zero'
    })
})

export default function App() {
  const containerRef = useRef(null)
  const [step, setStep] = useState(0)
  const [height, setHeight] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setHeight(containerRef.current.scrollHeight)
      }
    }

    // Atualiza na mudança de passo
    updateHeight()

    // Atualiza quando redimensionar a janela
    window.addEventListener('resize', updateHeight)

    // Cleanup para evitar vazamentos de memória
    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [step])

  const {
    register: infoRegister,
    watch: watchInfoValue,
    setValue: setInfoValue,
    handleSubmit: handleInfoSubmit,
    // getValues: getInfoValues,
    formState: { errors: infoErrors }
  } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      acceptTerms: false
    },
    resolver: zodResolver(InfoDataSchema)
  })

  const {
    register: moneyRegister,
    watch: watchMoneyValue,
    setValue: setMoneyValue,
    handleSubmit: handleMoneySubmit,
    getValues: getMoneyValues,
    formState: { errors: moneyErrors }
  } = useForm({
    defaultValues: {
      vencimento: 'ano',
      isentoDeImposto: 'sim',
      taxa: null,
      tipoDeTaxa: 'prefixado',
      periodo: null,
      periodoTipo: 'ano',
      aporteInicial: 0,
      aporteMensal: 0
    },
    resolver: zodResolver(MoneyDataSchema)
  })

  const phoneNumberValue = watchInfoValue('whatsapp')
  useEffect(() => {
    setInfoValue('whatsapp', formatPhoneNumber(phoneNumberValue))
  }, [phoneNumberValue, setInfoValue])

  const aporteInicialValue = watchMoneyValue('aporteInicial')
  const aporteMensalValue = watchMoneyValue('aporteMensal')

  useEffect(() => {
    if (aporteInicialValue) {
      setMoneyValue('aporteInicial', formatMoney(aporteInicialValue))
    }
  }, [aporteInicialValue, setMoneyValue])

  useEffect(() => {
    if (aporteMensalValue) {
      setMoneyValue('aporteMensal', formatMoney(aporteMensalValue))
    }
  }, [aporteMensalValue, setMoneyValue])

  const taxaValue = watchMoneyValue('taxa')

  useEffect(() => {
    if (taxaValue) {
      setMoneyValue('taxa', formatTaxa(taxaValue))
    }
  }, [taxaValue, setMoneyValue])

  const periodoValue = watchMoneyValue('periodo')

  useEffect(() => {
    if (periodoValue) {
      // Remove tudo que não for número
      const formattedValue = periodoValue.replace(/\D+/g, '')

      // Atualiza o valor formatado no formulário
      setMoneyValue('periodo', formattedValue)
    }
  }, [periodoValue, setMoneyValue])

  const calculate = async () => {
    const {
      tipoDeTaxa,
      periodo,
      periodoTipo,
      aporteInicial,
      aporteMensal,
      taxa,
      isentoDeImposto,
      vencimento
    } = getMoneyValues()

    let meses = periodo

    if (periodoTipo === 'ano') {
      meses = periodo * 12
    }

    const taxaValue =
      tipoDeTaxa === 'cdi'
        ? 0
        : Number(taxa.replace(/\./g, '').replace(',', '.'))
    const aporteInicialValue = Number(
      aporteInicial.replace(/\./g, '').replace(',', '.')
    )
    const aporteMensalValue = Number(
      aporteMensal.replace(/\./g, '').replace(',', '.')
    )

    const covertedTaxa =
      vencimento === 'meses' ? taxaValue / 100 : taxaValue / 12 / 100

    if (tipoDeTaxa === 'prefixado') {
      const montanteBruto =
        aporteInicialValue * Math.pow(1 + covertedTaxa, meses) +
        aporteMensalValue *
          ((Math.pow(1 + covertedTaxa, meses) - 1) / covertedTaxa)

      const totalInvestido = aporteInicialValue + aporteMensalValue * meses
      const rendimento = montanteBruto - totalInvestido

      const liquido =
        isentoDeImposto === 'sim'
          ? montanteBruto
          : montanteBruto - rendimento * 0.15

      setResult({
        montanteBruto,
        montanteLiquido: liquido
      })
    } else if (tipoDeTaxa === 'ipca+') {
      const ipcaData = await fetchIPCARateReal()

      const anoFinal = Math.max(...Object.keys(ipcaData).map(Number))
      const today = new Date()

      let montante = aporteInicialValue
      let totalInvestido = aporteInicialValue

      for (let i = 1; i <= meses; i++) {
        const futureDate = new Date(today)
        futureDate.setMonth(today.getMonth() + i)

        const ano = futureDate.getFullYear()
        const ipcaAno = ipcaData[ano]?.Media ?? ipcaData[anoFinal].Media // pega do ano ou último disponível

        const ipcaMes = ipcaAno / 12 / 100
        const taxaReal = covertedTaxa
        const taxaEfetiva = (1 + taxaReal) * (1 + ipcaMes) - 1

        // capitaliza o montante com a taxa efetiva + adiciona o aporte mensal
        montante = (montante + aporteMensalValue) * (1 + taxaEfetiva)
        totalInvestido += aporteMensalValue
      }

      const rendimento = montante - totalInvestido

      const liquido =
        isentoDeImposto === 'sim' ? montante : montante - rendimento * 0.15

      setResult({
        montanteBruto: montante,
        montanteLiquido: liquido
      })
    } else {
      const cdi = await fetchCDIRateReal()

      const anoFinal = Math.max(...Object.keys(cdi).map(Number))
      const today = new Date()

      let montante = aporteInicialValue
      let totalInvestido = aporteInicialValue

      for (let i = 1; i <= meses; i++) {
        const futureDate = new Date(today)
        futureDate.setMonth(today.getMonth() + i)

        const ano = futureDate.getFullYear()
        const ipcaAno = cdi[ano]?.Media
          ? cdi[ano]?.Medi * 1.2
          : cdi[anoFinal].Media * 1.2 // pega do ano ou último disponível

        const ipcaMes = ipcaAno / 12 / 100
        const taxaReal = taxaValue / 100 / 12
        const taxaEfetiva = (1 + taxaReal) * (1 + ipcaMes) - 1

        // capitaliza o montante com a taxa efetiva + adiciona o aporte mensal
        montante = (montante + aporteMensalValue) * (1 + taxaEfetiva)
        totalInvestido += aporteMensalValue
      }

      const rendimento = montante - totalInvestido

      const liquido =
        isentoDeImposto === 'sim' ? montante : montante - rendimento * 0.15

      setResult({
        montanteBruto: montante,
        montanteLiquido: liquido
      })
    }

    setStep((e) => e + 1)
  }

  let currentForm

  if (step === 0) {
    currentForm = (
      <motion.div
        key="step-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 flex flex-col items-center gap-10">
          {/* <img src="./logo.png" alt="logo" className="w-[200px]" /> */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-semibold text-center text-2xl text-blue-500">
              Calculadora de investimentos
            </h1>
            <p className="font-normal text-blue-500/50">
              Tempo de preenchimento: 1 minutos
            </p>
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button
              label="INICIAR"
              type="button"
              buttonAction={() => setStep(1)}
            />
          </div>
        </div>
      </motion.div>
    )
  } else if (step === 1) {
    currentForm = (
      <motion.div
        key="step-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleInfoSubmit(() => setStep((e) => e + 1))}>
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <Input
              id={'nome'}
              label={'Nome'}
              required
              register={infoRegister}
              error={infoErrors.nome}
            />
            <Input
              id={'email'}
              label={'Seu melhor email'}
              required
              register={infoRegister}
              error={infoErrors.email}
            />
            <Input
              id={'whatsapp'}
              label={'Whatsapp'}
              required
              register={infoRegister}
              error={infoErrors.whatsapp}
            />
            <div className="w-full flex justify-center items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...infoRegister('acceptTerms')}
                className="w-5 h-5 cursor-pointer accent-blue-500"
                style={{
                  backgroundColor: 'rgb(244 63 94)'
                }}
              />
              <label
                htmlFor="acceptTerms"
                className="text-xs sm:text-lg text-center cursor-pointer text-blue-500/80 w-full h-full"
              >
                Ao selecionar essa opção você aceita receber informações da nos
                contatos informados acima
              </label>
            </div>

            <span
              className={`text-red-500 ${infoErrors?.acceptTerms ? '' : 'invisible'}`}
            >
              {infoErrors.acceptTerms?.message || 'placeholder'}
            </span>
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 2) {
    currentForm = (
      <motion.div
        key="step-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handleMoneySubmit(() => calculate())}
          className="w-full h-full"
        >
          <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-2 w-full h-full">
            <Input
              id={'aporteInicial'}
              label={'Aporte Inicial'}
              required
              register={moneyRegister}
              error={moneyErrors.aporteInicial}
            />
            <Input
              id={'aporteMensal'}
              label={'Aporte Mensal'}
              required
              register={moneyRegister}
              error={moneyErrors.aporteMensal}
            />
          </div>
          <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-2 w-full h-full">
            <InputSelect
              options={[
                { label: 'Prefixado', value: 'prefixado' },
                { label: 'ipca+', value: 'ipca+' },
                { label: 'cdi', value: '+CDI' }
              ]}
              onChange={(e) => setMoneyValue('tipoDeTaxa', e)}
              value={watchMoneyValue('tipoDeTaxa')}
              error={moneyErrors.tipoDeTaxa}
              label="Tipo de taxa"
            />
            <InputSelect
              options={[
                { label: 'Isento', value: 'sim' },
                { label: 'Não isento', value: 'não' }
              ]}
              onChange={(e) => setMoneyValue('isentoDeImposto', e)}
              value={watchMoneyValue('isentoDeImposto')}
              error={moneyErrors.isentoDeImposto}
              label="Imposto de Renda"
            />
          </div>
          <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-2 w-full h-full">
            {watchMoneyValue('tipoDeTaxa') !== '+CDI' && (
              <div className="w-full flex gap-1">
                <Input
                  id={'taxa'}
                  label={'Taxa de juros %'}
                  required
                  register={moneyRegister}
                  error={moneyErrors.taxa}
                />
                <div className="min-w-36 w-[20%]">
                  <InputSelect
                    options={[
                      { label: 'mensal', value: 'meses' },
                      { label: 'anual', value: 'ano' }
                    ]}
                    onChange={(e) => setMoneyValue('vencimento', e)}
                    value={watchMoneyValue('vencimento')}
                    error={moneyErrors.vencimento}
                    label=""
                  />
                </div>
              </div>
            )}

            <div className="w-full flex gap-1">
              <Input
                id={'periodo'}
                label={'Período'}
                required
                register={moneyRegister}
                error={moneyErrors.periodo}
              />
              <div className="min-w-36 w-[20%]">
                <InputSelect
                  options={[
                    { label: 'mes(es)', value: 'mes' },
                    { label: 'ano(s)', value: 'ano' }
                  ]}
                  onChange={(e) => setMoneyValue('periodoTipo', e)}
                  value={watchMoneyValue('periodoTipo')}
                  error={moneyErrors.periodoTipo}
                  label=""
                />
              </div>
            </div>
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else {
    currentForm = (
      <motion.div
        key="step-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <p>
          Montante Bruto:{' '}
          {result.montanteBruto.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
        <p>
          Montante Líquido:{' '}
          {result.montanteLiquido.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <motion.div
        animate={{ height }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden bg-white/90 rounded transition-allduration-300 ease-in-out w-full max-w-200"
      >
        <div className="w-full py-10" ref={containerRef}>
          {currentForm}
        </div>
      </motion.div>
    </div>
  )
}

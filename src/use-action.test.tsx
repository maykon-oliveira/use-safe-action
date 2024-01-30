import { act, renderHook } from '@testing-library/react-hooks'
import { useAction } from "./use-action";
import { z } from 'zod';
import { ActionState, createSafeAction } from './create-safe-action';

const MySchema = z.object({
  key: z.string({invalid_type_error: 'required'})
})

type MySchema = z.infer<typeof MySchema>

type ReturnType = ActionState<MySchema, string>

test('hook initial state', () => {
  const { result } = renderHook(() => {
    const handler = async (input: MySchema): Promise<ReturnType> => {
      return {
        data: 'Test'
      }
    }

    const action = createSafeAction(MySchema, handler)

    return useAction(action)
  })

  expect(result.current.isLoading).toBe(false)
  expect(result.current.error).toBeUndefined()
  expect(result.current.fieldErrors).toBeUndefined()
  expect(typeof result.current.execute).toBe('function')
})

test('when the handler throws an error', async () => {
  const error = "An error";
  const { result } = renderHook(() => {
    const handler = async (input: MySchema): Promise<ReturnType> => {
      return {
        error
      }
    }

    const action = createSafeAction(MySchema, handler)

    return useAction(action)
  })

  await act(async () => {
    await result.current.execute({ key: 'something' })
  })

  expect(result.current.error).toBe(error)
})

test('when the provided object is not a valid one', async () => {
  const { result } = renderHook(() => {
    const handler = async (input: MySchema): Promise<ReturnType> => {
      return {
        data: ''
      }
    }

    const action = createSafeAction(MySchema, handler)

    return useAction(action)
  })

  await act(async () => {
    await result.current.execute({ key: null as unknown as string })
  })

  expect(result.current.fieldErrors?.key![0]).toBe("required")
})

test('when the provided object is valid should returns data', async () => {
  const { result } = renderHook(() => {
    const handler = async (input: MySchema): Promise<ReturnType> => {
      return {
        data: input.key
      }
    }

    const action = createSafeAction(MySchema, handler)

    return useAction(action)
  })

  await act(async () => {
    await result.current.execute({ key: 'Test' })
  })

  expect(result.current.data).toBe('Test')
  expect(result.current.error).toBeUndefined()
})
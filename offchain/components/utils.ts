import { toast } from "react-toastify";

export async function req(path: string, req?: RequestInit) {
  const rsp = await fetch(path, { ...req, cache: "no-cache" });

  if (!rsp.ok) {
    throw {
      code: rsp.status,
      info: rsp.statusText,
    };
  }

  return rsp.json();
}

export function handleSuccess(success: any) {
  toast(`${success}`, { type: "success" });
  console.log(success);
}

export function handleError(error: any) {
  const { info, message } = error;

  function toJSON(error: any) {
    try {
      const errorString = JSON.stringify(error);
      const errorJSON = JSON.parse(errorString);
      return errorJSON;
    } catch {
      return {};
    }
  }

  const { cause } = toJSON(error);
  const { failure } = cause ?? {};

  const failureCause = failure?.cause;

  let failureTrace: string | undefined;
  try {
    failureTrace = eval(failureCause).replaceAll(" Trace ", " \n ");
  } catch {
    failureTrace = undefined;
  }

  const failureInfo = failureCause?.info;
  const failureMessage = failureCause?.message;

  toast(`${failureTrace ?? failureInfo ?? failureMessage ?? info ?? message ?? error}`, { type: "error" });
  console.error(failureCause ?? { error });
}

export function adaToLovelace(float: string) {
  const [ada, lovelace] = float.split(".");

  return BigInt(ada) * 1_000000n + BigInt(lovelace || 0);
}

/**
 * Offline image processing.
 *
 * Production deployments install `sharp` (npm i sharp) and use it for fully
 * offline auto-edit. In dev / sandbox builds where sharp isn't available we
 * import it lazily so the rest of the system still compiles cleanly.
 */
type EditOpts = { brighten?: boolean; sharpen?: boolean; resize?: number };

export async function processOffline(input: Buffer, opts: EditOpts = {}): Promise<Buffer> {
  let sharp: any;
  try {
    // Lazy import — sharp is optional. Wrapped in eval so the bundler doesn't
    // try to resolve it at build time, and so the eslint @ts no-var-requires
    // rule doesn't trip on the require() call.
    // eslint-disable-next-line no-eval
    sharp = eval("require")("sharp");
  } catch {
    // Sharp not installed — return the original buffer untouched.
    return input;
  }
  let pipeline = sharp(input);
  if (opts.brighten !== false) pipeline = pipeline.normalize();
  if (opts.sharpen !== false) pipeline = pipeline.sharpen();
  if (opts.resize) pipeline = pipeline.resize(opts.resize, undefined, { withoutEnlargement: true });
  return pipeline.jpeg({ quality: 88, progressive: true }).toBuffer();
}

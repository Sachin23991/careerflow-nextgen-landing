// Minimal local shim for `remark-gfm` so Vite can resolve the import when the package isn't installed.
// Replace with "import remarkGfm from 'remark-gfm'" after running: npm install remark-gfm
export default function remarkGfmShim() {
	// remark plugins are functions that accept options and return transformer — no-op here
	return () => {};
}

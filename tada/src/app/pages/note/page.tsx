import { createRoot } from 'react-dom/client'
import { NoteShell } from './components/note-shell'
import { WindowProvider } from '../../providers/window'

import 'normalize.css'
import '../../assets/global.css'

createRoot(document.getElementById('root')!).render(
	<WindowProvider>
		<NoteShell />
	</WindowProvider>
)
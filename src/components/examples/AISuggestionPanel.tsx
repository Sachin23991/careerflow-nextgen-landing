import { AISuggestionPanel } from '../AISuggestionPanel';

export default function AISuggestionPanelExample() {
  return (
    <div className="p-6 max-w-md">
      <AISuggestionPanel
        context={{ role: 'Software Engineer', tone: 'professional', type: 'summary' }}
        onApply={(text) => console.log('Applied:', text)}
      />
    </div>
  );
}

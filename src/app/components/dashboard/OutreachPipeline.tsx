import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface OutreachPipelineProps {
  stages: PipelineStage[];
}

export default function OutreachPipeline({ stages }: OutreachPipelineProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#e9ebef] p-6 rounded-lg">
      <h3 className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
        Outreach Pipeline
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {stages.map((stage, index) => (
          <div key={index} className="text-center">
            <div
              className="w-full h-20 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${stage.color}15` }}
            >
              <span
                className="text-3xl"
                style={{ color: stage.color, fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif' }}
              >
                {stage.count}
              </span>
            </div>
            <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{stage.name}</p>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-6"
        style={{ fontFamily: 'Inter, sans-serif' }}
        onClick={() => navigate('/dashboard/outreach')}
      >
        View all outreach
      </Button>
    </div>
  );
}

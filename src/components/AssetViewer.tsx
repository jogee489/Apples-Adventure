import { ASSETS } from '../constants';

export default function AssetViewer() {
  return (
    <div className="flex flex-col gap-8 p-6 overflow-y-auto w-full h-full pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Apple the Panda Sprite Sheet</h2>
        <p className="text-sm text-slate-500">Idle | Walk | Attack | Hit Reaction</p>
        <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto border border-slate-100 flex items-center justify-center min-h-[160px]">
          <img src={ASSETS.APPLE_SPRITE} alt="Apple Panda" className="h-40 max-w-none pixelated" style={{ imageRendering: 'pixelated' }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Bread Mountain Enemies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Angry Toast</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.ANGRY_TOAST} alt="Angry Toast" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Baguette Snake</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.BAGUETTE_SNAKE} alt="Baguette Snake" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Croissant Bat</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.CROISSANT_BAT} alt="Croissant Bat" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Sandwich Crab</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.SANDWICH_CRAB} alt="Sandwich Crab" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Sweet Enemies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Donut Slime</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.DONUT_SLIME} alt="Donut Slime" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Pretzel Spider</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.PRETZEL_SPIDER} alt="Pretzel Spider" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Pancake Turtle</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.PANCAKE_TURTLE} alt="Pancake Turtle" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-2">Cinnamon Armadillo</p>
            <p className="text-xs text-slate-500 mb-2">Idle | Walk | Attack | Hit</p>
            <img src={ASSETS.CINNAMON_ARMADILLO} alt="Cinnamon Armadillo" className="h-16 max-w-none pixelated mx-auto" style={{ imageRendering: 'pixelated' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Sky & Ocean Background</h2>
        <div className="bg-sky-50 rounded-xl overflow-hidden border border-slate-100 w-full relative aspect-[16/5]">
          <img src={ASSETS.BG_SKY} alt="Sky Layer" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Bread Mountain Background</h2>
        <div className="bg-sky-100 rounded-xl overflow-hidden border border-slate-100 w-full relative aspect-[16/5]">
          <img src={ASSETS.BG_MOUNTAIN} alt="Mountain Layer" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Beach Foreground</h2>
        <div className="bg-sky-200 rounded-xl overflow-hidden border border-slate-100 w-full relative aspect-[16/5]">
          <img src={ASSETS.BG_BEACH} alt="Beach Layer" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

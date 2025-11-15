import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sword, Sparkles, Zap, Shield } from 'lucide-react';

const ARCHETYPES = [
  {
    id: 'warrior',
    name: 'Warrior',
    icon: Sword,
    description: 'Competitive and driven. Thrives on challenges and pushing limits.',
    color: 'bg-red-100 text-red-600 border-red-300',
  },
  {
    id: 'mage',
    name: 'Mage',
    icon: Sparkles,
    description: 'Analytical and strategic. Learns from data and patterns.',
    color: 'bg-purple-100 text-purple-600 border-purple-300',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    icon: Zap,
    description: 'Adaptable and spontaneous. Finds creative shortcuts.',
    color: 'bg-yellow-100 text-yellow-600 border-yellow-300',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    icon: Shield,
    description: 'Methodical and reliable. Builds steady, lasting progress.',
    color: 'bg-green-100 text-green-600 border-green-300',
  },
];

const SKIN_TONES = [
  { id: 'light', color: '#FFDAB9', label: 'Light' },
  { id: 'medium-light', color: '#DEB887', label: 'Medium Light' },
  { id: 'medium', color: '#D2691E', label: 'Medium' },
  { id: 'medium-dark', color: '#8B4513', label: 'Medium Dark' },
  { id: 'dark', color: '#654321', label: 'Dark' },
  { id: 'deep', color: '#3D2817', label: 'Deep' },
];

const HAIR_STYLES = [
  'Short & Spiky',
  'Long & Flowing',
  'Ponytail',
  'Buzz Cut',
  'Curly',
  'Braided',
  'Mohawk',
  'Bald',
];

const OUTFIT_COLORS = [
  { primary: '#1E40AF', secondary: '#60A5FA', label: 'Blue' },
  { primary: '#DC2626', secondary: '#F87171', label: 'Red' },
  { primary: '#059669', secondary: '#34D399', label: 'Green' },
  { primary: '#7C3AED', secondary: '#A78BFA', label: 'Purple' },
  { primary: '#EA580C', secondary: '#FB923C', label: 'Orange' },
  { primary: '#0891B2', secondary: '#22D3EE', label: 'Cyan' },
];

export default function CharacterSelect() {
  const [selectedArchetype, setSelectedArchetype] = useState('warrior');
  const [gender, setGender] = useState('male');
  const [skinTone, setSkinTone] = useState('medium');
  const [hairStyle, setHairStyle] = useState('Short & Spiky');
  const [outfitColor, setOutfitColor] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!currentUser) return;

    setLoading(true);

    const customization = {
      gender,
      skinTone,
      hairStyle,
      outfitPrimary: OUTFIT_COLORS[outfitColor].primary,
      outfitSecondary: OUTFIT_COLORS[outfitColor].secondary,
    };

    await updateUser(currentUser.uid, {
      championArchetype: selectedArchetype,
      championCustomization: customization,
      onboardingCompleted: true,
      updatedAt: new Date(),
    });

    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose Your Champion</h1>
          <p className="text-gray-600">
            Select your archetype and customize your character
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Customization */}
          <div className="space-y-6">
            {/* Archetype Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Archetype</CardTitle>
                <CardDescription>Choose the path that resonates with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {ARCHETYPES.map((archetype) => {
                    const Icon = archetype.icon;
                    return (
                      <button
                        key={archetype.id}
                        onClick={() => setSelectedArchetype(archetype.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedArchetype === archetype.id
                            ? `${archetype.color} border-2`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <h3 className="font-semibold text-center">{archetype.name}</h3>
                        <p className="text-xs text-center mt-1 opacity-75">
                          {archetype.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Gender */}
            <Card>
              <CardHeader>
                <CardTitle>Gender</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={gender} onValueChange={setGender}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary">Non-binary</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Skin Tone */}
            <Card>
              <CardHeader>
                <CardTitle>Skin Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSkinTone(tone.id)}
                      className={`w-12 h-12 rounded-full border-2 ${
                        skinTone === tone.id ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: tone.color }}
                      title={tone.label}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hair Style */}
            <Card>
              <CardHeader>
                <CardTitle>Hair Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setHairStyle(style)}
                      className={`px-4 py-2 rounded-md border text-sm ${
                        hairStyle === style
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Outfit Color */}
            <Card>
              <CardHeader>
                <CardTitle>Outfit Color</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {OUTFIT_COLORS.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setOutfitColor(index)}
                      className={`w-12 h-12 rounded-full border-2 ${
                        outfitColor === index ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                      }}
                      title={color.label}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Preview */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Your Champion</CardTitle>
                <CardDescription>This is how your character will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {/* Placeholder for character preview */}
                    <div
                      className="w-48 h-48 mx-auto rounded-full mb-4"
                      style={{
                        background: `linear-gradient(135deg, ${OUTFIT_COLORS[outfitColor].primary} 0%, ${OUTFIT_COLORS[outfitColor].secondary} 100%)`,
                      }}
                    />
                    <h3 className="text-xl font-bold mb-2">
                      {ARCHETYPES.find((a) => a.id === selectedArchetype)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {gender.charAt(0).toUpperCase() + gender.slice(1)} • {hairStyle}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Character preview coming soon!
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full mt-6"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Creating Champion...' : 'Start Your Journey'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

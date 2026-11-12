import { useState } from 'react';
import './App.css';

type Genre = 'おまかせ' | '和食' | 'イタリアン' | 'フレンチ' | '中華' | 'おつまみ系';

interface Recipe {
  id: string;
  genre: Exclude<Genre, 'おまかせ'>;
  title: string;
  time: string;
  description: string;
  seasonings: string;
  steps: string;
}

const GENRES: { label: Genre; icon: string }[] = [
  { label: 'おまかせ', icon: '✨' },
  { label: '和食', icon: '🍚' },
  { label: 'イタリアン', icon: '🍝' },
  { label: 'フレンチ', icon: '🥖' },
  { label: '中華', icon: '🥟' },
  { label: 'おつまみ系', icon: '🍺' },
];

const QUICK_INGREDIENTS = [
  '卵', 'キャベツ', '豚バラ肉', '鶏もも肉', '玉ねぎ',
  'もやし', '豆腐', 'ベーコン', 'じゃがいも', 'きのこ', 'ツナ缶', 'チーズ'
];

// ジャンル別のレシピテンプレート群
const RECIPE_TEMPLATES: Record<
  Exclude<Genre, 'おまかせ'>,
  Array<{
    titleFn: (main: string, sub: string) => string;
    time: string;
    descFn: (all: string) => string;
    seasonings: string;
    stepsFn: (main: string, sub: string) => string;
  }>
> = {
  和食: [
    {
      titleFn: (m, s) => `${m}と${s}の甘辛照り焼き炒め`,
      time: '約10分',
      descFn: (all) => `冷蔵庫の${all}をサッと炒めて甘辛い和風ダレを絡めた、ご飯が止まらない定番おかずです。`,
      seasonings: '醤油 大さじ1.5、みりん 大さじ1.5、砂糖 小さじ2、サラダ油',
      stepsFn: (m, s) => `一口大に切った${m}と${s}を中火で炒め、火が通ったら合わせた調味料を一気に回し入れて照りが出るまで絡めます。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のほっこり和風あんかけ`,
      time: '約15分',
      descFn: (all) => `${all}の旨味が溶け出した優しい出汁あんが体にしみわたる一品です。`,
      seasonings: '白だし 大さじ2、水 200ml、片栗粉 大さじ1（水溶き用）、おろし生姜 少々',
      stepsFn: (m, s) => `${m}と${s}を白だしと水でさっと煮て、仕上げに水溶き片栗粉でとろみをつけ、お好みで生姜を添えます。`,
    },
    {
      titleFn: (m, s) => `レンジで簡単！${m}と${s}の旨塩ナムル風お浸し`,
      time: '約7分',
      descFn: (all) => `火を使わずに${all}を消費できる、あと一品欲しいときに嬉しい時短副菜です。`,
      seasonings: '鶏ガラスープの素 小さじ1、ごま油 大さじ1、白ごま 適量、塩少々',
      stepsFn: (m, s) => `食べやすく切った${m}と${s}を耐熱ボウルに入れてふんわりラップをし、600Wで3分加熱して水気を切り調味料と和えます。`,
    },
  ],
  イタリアン: [
    {
      titleFn: (m, s) => `${m}と${s}のガーリックペペロンチーノ風ソテー`,
      time: '約10分',
      descFn: (all) => `にんにくとオリーブオイルの香りが食欲をそそる、${all}を使ったバル風ソテーです。`,
      seasonings: 'オリーブオイル 大さじ1.5、にんにくチューブ 3cm、塩・黒こしょう 適量、鷹の爪（あれば）',
      stepsFn: (m, s) => `フライパンにオリーブオイルとにんにくを熱し、香りが立ったら${m}と${s}をこんがり焼き色がつくまで炒め、塩こしょうで味を調えます。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のトマトチーズ蒸し焼き`,
      time: '約15分',
      descFn: (all) => `${all}をフライパンひとつで蒸し焼きにし、とろ〜りチーズで仕上げるカフェ風メインディッシュ。`,
      seasonings: 'ケチャップ 大さじ2（またはトマト缶）、コンソメ 小さじ1、ピザ用チーズ 適量、オリーブオイル',
      stepsFn: (m, s) => `${m}と${s}を炒めてケチャップとコンソメを加えて軽く煮込み、上にチーズをのせて蓋をし、弱火で2分蒸らします。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}の具だくさんフリッタータ（イタリアンオムレツ）`,
      time: '約12分',
      descFn: (all) => `余った${all}をまとめて包み込む、見た目も華やかなボリューム満点オムレツです。`,
      seasonings: '卵 2〜3個、粉チーズ 大さじ1、塩こしょう 少々、オリーブオイル',
      stepsFn: (m, s) => `炒めた${m}と${s}に、粉チーズと塩こしょうを混ぜた溶き卵を流し入れ、弱火で蓋をしてじっくり焼き上げます。`,
    },
  ],
  フレンチ: [
    {
      titleFn: (m, s) => `${m}と${s}の焦がしバター醤油ポワレ`,
      time: '約12分',
      descFn: (all) => `いつもの${all}がバターのコクと香ばしさで一気にビストロ風のメイン料理に変身します。`,
      seasonings: 'バター 15g、醤油 小さじ2、レモン汁 小さじ1（あれば）、塩・白こしょう',
      stepsFn: (m, s) => `塩こしょうした${m}と${s}を香ばしく焼き、火を止める直前にバターと醤油を加えて全体にアロゼ（回しかけ）します。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のクリームフリカッセ（白い煮込み）`,
      time: '約15分',
      descFn: (all) => `牛乳とコンソメで手軽に作る、${all}の甘みが引き立つ優しいフレンチ家庭料理です。`,
      seasonings: '牛乳 150ml、バター 10g、薄力粉 大さじ1、コンソメ 小さじ1.5、塩こしょう',
      stepsFn: (m, s) => `バターで${m}と${s}を炒めて薄力粉を絡め、牛乳とコンソメを少しずつ加えてとろみがつくまで弱火で5分煮込みます。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}の粒マスタードマリネサラダ`,
      time: '約8分',
      descFn: (all) => `さっぱりとした酸味とマスタードの風味がクセになる、${all}を使ったおしゃれなデリ風前菜。`,
      seasonings: '粒マスタード 小さじ2、酢（またはレモン汁）大さじ1、オリーブオイル 大さじ1、はちみつ 小さじ1',
      stepsFn: (m, s) => `サッと茹でるかレンジ加熱した${m}と${s}の粗熱を取り、混ぜ合わせたマスタードドレッシングで和えます。`,
    },
  ],
  中華: [
    {
      titleFn: (m, s) => `${m}と${s}のコク旨オイスター炒め`,
      time: '約10分',
      descFn: (all) => `オイスターソースの濃厚な旨味で、冷蔵庫の${all}が本格町中華の一皿に仕上がります。`,
      seasonings: 'オイスターソース 大さじ1、醤油 小さじ1、鶏ガラスープの素 小さじ1/2、ごま油',
      stepsFn: (m, s) => `強めの中火で${m}と${s}をサッと炒め、合わせ調味料を鍋肌から回し入れて強火で一気に絡めます。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のピリ辛麻婆風とろみ炒め`,
      time: '約12分',
      descFn: (all) => `豆板醤のピリッとした辛さがアクセント！${all}がモリモリ食べられるスタミナ中華です。`,
      seasonings: '豆板醤 小さじ1、味噌 小さじ2、醤油 小さじ1、水 100ml、水溶き片栗粉 適量',
      stepsFn: (m, s) => `${m}と${s}と豆板醤を炒め、水と調味料を加えて一煮立ちさせたら、水溶き片栗粉でとろみをつけます。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のふんわり中華風卵とじ`,
      time: '約8分',
      descFn: (all) => `ごま油の香りとふんわり卵が${all}を優しく包み込む、忙しい日のスピード中華です。`,
      seasonings: '卵 2個、鶏ガラスープの素 小さじ1、ごま油 大さじ1、塩こしょう 少々',
      stepsFn: (m, s) => `多めのごま油で半熟状に炒めた卵を一度取り出し、${m}と${s}を鶏ガラで炒めた後に卵を戻してサッと合わせます。`,
    },
  ],
  おつまみ系: [
    {
      titleFn: (m, s) => `やみつき！${m}と${s}のガリバタ醤油焼き`,
      time: '約8分',
      descFn: (all) => `にんにく×バター×醤油の黄金トリオで${all}を焼いた、ビールやハイボールに最高のおつまみ！`,
      seasonings: 'バター 10g、にんにくチューブ 3cm、醤油 大さじ1、粗挽き黒こしょう たっぷり',
      stepsFn: (m, s) => `${m}と${s}をこんがり焼き、バターとにんにくを加えて香りが出たら醤油を垂らし、黒こしょうをたっぷり振ります。`,
    },
    {
      titleFn: (m, s) => `${m}と${s}のピリ辛ごま油ユッケ風和え`,
      time: '約6分',
      descFn: (all) => `包丁いらず・レンジだけで完結！${all}が無限に食べられる濃厚ピリ辛おつまみです。`,
      seasonings: 'コチュジャン 小さじ1.5、ごま油 大さじ1、醤油 小さじ1、いりごま 適量（あれば卵黄）',
      stepsFn: (m, s) => `加熱した${m}と${s}の水気をよく拭き取り、コチュジャン・ごま油・醤油で和えて仕上げにごまを振ります。`,
    },
    {
      titleFn: (m, s) => `カリッと香ばしい！${m}と${s}のチーズガレット`,
      time: '約10分',
      descFn: (all) => `刻んだ${all}にチーズと片栗粉を混ぜて焼くだけ。外はカリカリ、中はモチモチの絶品おつまみ。`,
      seasonings: 'ピザ用チーズ 40g、片栗粉 大さじ1.5、コンソメ 小さじ1/2、オリーブオイル',
      stepsFn: (m, s) => `細かく切った${m}と${s}にチーズ・片栗粉・コンソメを混ぜ、フライパンに薄く広げて両面カリッと焼き上げます。`,
    },
  ],
};

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['卵', 'キャベツ']);
  const [selectedGenre, setSelectedGenre] = useState<Genre>('おまかせ');
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // 食材を追加する処理（読点・カンマ・スペース区切り対応）
  const handleAddIngredient = (rawText?: string) => {
    const target = rawText !== undefined ? rawText : inputValue;
    const items = target
      .split(/[、,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length === 0) return;

    setIngredients((prev) => {
      const next = [...prev];
      items.forEach((item) => {
        if (!next.includes(item)) {
          next.push(item);
        }
      });
      return next;
    });

    if (rawText === undefined) {
      setInputValue('');
    }
  };

  // クイック候補のトグル
  const toggleQuickIngredient = (item: string) => {
    if (ingredients.includes(item)) {
      setIngredients((prev) => prev.filter((i) => i !== item));
    } else {
      setIngredients((prev) => [...prev, item]);
    }
  };

  // 食材削除
  const removeIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  };

  // 3案のレシピを生成
  const generateRecipes = () => {
    const activeItems = ingredients.length > 0 ? ingredients : ['冷蔵庫の余り野菜', '卵'];
    const main = activeItems[0];
    const sub = activeItems.length > 1 ? activeItems[1] : 'お好みの具材';
    const allText = activeItems.join('・');

    const allGenres: Exclude<Genre, 'おまかせ'>[] = [
      '和食',
      'イタリアン',
      'フレンチ',
      '中華',
      'おつまみ系',
    ];

    const generated: Recipe[] = [];

    if (selectedGenre === 'おまかせ') {
      // ランダムに3ジャンル選んで1案ずつ生成
      const shuffledGenres = [...allGenres].sort(() => Math.random() - 0.5).slice(0, 3);
      shuffledGenres.forEach((g, idx) => {
        const templates = RECIPE_TEMPLATES[g];
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        generated.push({
          id: `${Date.now()}-${idx}`,
          genre: g,
          title: tpl.titleFn(main, sub),
          time: tpl.time,
          description: tpl.descFn(allText),
          seasonings: tpl.seasonings,
          steps: tpl.stepsFn(main, sub),
        });
      });
    } else {
      // 指定ジャンルの3バリエーションを生成（食材の並びを少し変えてバリエーション化）
      const templates = RECIPE_TEMPLATES[selectedGenre];
      templates.forEach((tpl, idx) => {
        const m = activeItems[idx % activeItems.length];
        const s =
          activeItems.length > 1
            ? activeItems[(idx + 1) % activeItems.length]
            : '彩り野菜';
        generated.push({
          id: `${Date.now()}-${idx}`,
          genre: selectedGenre,
          title: tpl.titleFn(m, s),
          time: tpl.time,
          description: tpl.descFn(allText),
          seasonings: tpl.seasonings,
          steps: tpl.stepsFn(m, s),
        });
      });
    }

    setRecipes(generated);
  };

  return (
    <div className="app-wrapper">
      {/* ヘッダー */}
      <header className="app-header">
        <h1 className="app-title">
          <span>🍳</span> おうちごはん 献立ジェネレーター
        </h1>
        <p className="app-subtitle">
          あるものだけでパパッと決まる！3つのレシピをご提案
        </p>
      </header>

      {/* 入力セクション */}
      <main className="card">
        <label className="section-label">1. 冷蔵庫にある食材を入力</label>
        <div className="input-group">
          <input
            type="text"
            className="ingredient-input"
            placeholder="例：豚肉、キャベツ、にんじん"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddIngredient();
              }
            }}
          />
          <button
            type="button"
            className="add-btn"
            onClick={() => handleAddIngredient()}
          >
            追加
          </button>
        </div>

        {/* 選択中の食材タグ */}
        <div className="selected-tags">
          {ingredients.length === 0 ? (
            <p className="empty-hint">
              ※上の入力欄か、下の定番食材をタップして追加してください
            </p>
          ) : (
            ingredients.map((item) => (
              <span key={item} className="ingredient-tag">
                {item}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeIngredient(item)}
                  aria-label={`${item}を削除`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {/* ワンタップ追加 */}
        <div className="quick-add-area">
          <p className="quick-add-title">よく余る定番食材（タップで追加/解除）</p>
          <div className="quick-chips">
            {QUICK_INGREDIENTS.map((item) => {
              const isSelected = ingredients.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`quick-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleQuickIngredient(item)}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* ジャンル選択 */}
        <label className="section-label">2. 料理のジャンルを選択</label>
        <div className="genre-grid">
          {GENRES.map((g) => (
            <button
              key={g.label}
              type="button"
              className={`genre-btn ${selectedGenre === g.label ? 'selected' : ''}`}
              onClick={() => setSelectedGenre(g.label)}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        {/* 生成ボタン */}
        <button
          type="button"
          className="generate-btn"
          onClick={generateRecipes}
        >
          🍽️ 献立を3案提案してもらう！
        </button>
      </main>

      {/* 提案結果 */}
      {recipes.length > 0 && (
        <section aria-label="提案された献立">
          <div className="results-header">
            <h2 className="results-title">✨ おすすめ献立 3選</h2>
          </div>

          {recipes.map((recipe, index) => (
            <article key={recipe.id} className="recipe-card">
              <div className="recipe-top">
                <span className="recipe-badge">
                  提案 {index + 1}・{recipe.genre}
                </span>
                <span className="recipe-time">⏱ {recipe.time}</span>
              </div>
              <h3 className="recipe-name">{recipe.title}</h3>
              <p className="recipe-desc">{recipe.description}</p>
              <div className="recipe-meta">
                <div className="meta-row">
                  <span className="meta-label">🧂 調味料:</span>
                  <span>{recipe.seasonings}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">👩‍🍳 作り方:</span>
                  <span>{recipe.steps}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
/**
 * Game guide dialog - explains story background and roles
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Flame,
  Ghost,
  Ear,
  Search,
  Users,
  Shield,
  User,
  Skull,
  Mountain,
  Snowflake,
} from 'lucide-react';

interface GameGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameGuide({ open, onOpenChange }: GameGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mountain className="w-6 h-6" />
            白烬山口 - 游戏说明
          </DialogTitle>
          <DialogDescription>
            寂静山庄的故事与角色介绍
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Story Background */}
            <section>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-blue-400" />
                故事背景
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">1913年，深冬。白烬山口，寂静山庄。</strong>
                </p>
                <p>
                  一份神秘的委托书将15名陌生人召集至此。他们来自伦敦、爱丁堡、曼彻斯特——有人为了钱，有人为了逃避，有人为了寻找，有人为了赎罪。委托人承诺每人500英镑，足以改变命运的金额。
                </p>
                <p className="text-foreground">
                  第一天，他们在山庄集合。第二天，委托人未出现。第三天，一场诡异的暴风雪封锁了下山的所有道路。他们在地窖里发现了旧主人留下的遗书：
                </p>
                <p className="pl-4 border-l-2 border-amber-500/50 italic">
                  "山灵警告：你们之中混入了三个非人者。它们会在夜晚猎杀真正的人类。你们必须在白昼找出这三个非人者并献祭，否则所有人都会死。"
                </p>
                <p className="text-foreground pt-2">
                  第七天，在绝望与恐惧的驱使下，他们决定按照遗书的指示举行献祭仪式。无论真假，他们已别无选择。
                </p>
                <p className="text-amber-400 font-semibold">
                  山灵的契约已成。收割与羔羊的博弈，正式开始。
                </p>
                <p className="text-red-400 font-semibold">
                  这不是游戏。这是真实的生死存亡。
                </p>
              </div>
            </section>

            {/* Win Conditions */}
            <section className="border-t pt-4">
              <h3 className="text-lg font-bold mb-3">胜利条件</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-400">收割阵营获胜</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    当收割者（烙印者+背誓者）数量 ≥ 羔羊数量时，收割阵营获胜
                  </p>
                </div>
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">羔羊阵营获胜</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    当所有收割者（烙印者+背誓者）被淘汰时，羔羊阵营获胜
                  </p>
                </div>
              </div>
            </section>

            {/* Harvest Faction */}
            <section className="border-t pt-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-400">
                <Skull className="w-5 h-5" />
                收割阵营 (4人)
              </h3>
              <div className="space-y-4">
                {/* Marked */}
                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">烙印者 (The Marked)</h4>
                      <Badge className="bg-red-600 text-xs">3人</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">夜晚能力：</strong>每晚集体讨论并投票杀死一名玩家</li>
                    <li>• <strong className="text-foreground">白天伪装：</strong>必须伪装成羔羊，隐藏身份</li>
                    <li>• <strong className="text-foreground">队友识别：</strong>互相知道对方是烙印者，可以夜间交流</li>
                    <li>• <strong className="text-red-400">生存威胁：</strong>如果被发现，会被献祭。那是真正的死亡。</li>
                  </ul>
                </div>

                {/* Heretic */}
                <div className="bg-slate-950/20 border border-slate-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-900 rounded-full flex items-center justify-center">
                      <Ghost className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">背誓者 (The Heretic)</h4>
                      <Badge className="bg-slate-700 text-xs">1人</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">特殊觉醒：</strong>第1天不知道自己身份，第2天才觉醒堕落</li>
                    <li>• <strong className="text-foreground">孤独存在：</strong>无法参与烙印者的夜晚讨论和杀人</li>
                    <li>• <strong className="text-foreground">查验显示：</strong>被聆心者查验会显示为"污秽"（与烙印者相同）</li>
                    <li>• <strong className="text-foreground">混乱武器：</strong>只能在白天通过发言和投票帮助收割阵营</li>
                    <li>• <strong className="text-red-400">最危险角色：</strong>比烙印者更容易被发现，更孤独，更容易死</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Lamb Faction */}
            <section className="border-t pt-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-400">
                <Shield className="w-5 h-5" />
                羔羊阵营 (11人)
              </h3>
              <div className="space-y-4">
                {/* Listener */}
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-900 rounded-full flex items-center justify-center">
                      <Ear className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">聆心者 (The Heart-Listener)</h4>
                      <Badge className="bg-purple-600 text-xs">1人 · 预言家</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">夜晚能力：</strong>每晚可查验一名玩家是"清白"（羔羊）还是"污秽"（收割者）</li>
                    <li>• <strong className="text-foreground">信息优势：</strong>掌握关键信息，可以引导羔羊找出收割者</li>
                    <li>• <strong className="text-purple-400">策略抉择：</strong>公开身份获取信任，但会成为烙印者的首要目标</li>
                    <li>• <strong className="text-red-400">生存警告：</strong>一旦暴露，明早可能就是尸体</li>
                  </ul>
                </div>

                {/* Coroner */}
                <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-700 to-cyan-900 rounded-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">食灰者 (The Ash-Walker)</h4>
                      <Badge className="bg-cyan-700 text-xs">1人 · 验尸官</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">被动能力：</strong>每次白天献祭后，当晚会得知被献祭者是"清白"还是"污秽"</li>
                    <li>• <strong className="text-foreground">信息验证：</strong>可以确认被献祭的人是否是收割者</li>
                    <li>• <strong className="text-cyan-400">双刃剑：</strong>公开信息获得信任，但会成为烙印者的目标</li>
                    <li>• <strong className="text-foreground">平衡决策：</strong>隐藏信息保命，但信息无法传递给队友</li>
                  </ul>
                </div>

                {/* Twin */}
                <div className="bg-teal-950/20 border border-teal-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">共誓者 (The Co-Sworn)</h4>
                      <Badge className="bg-teal-600 text-xs">2人 · 双子</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">天然认证：</strong>两名共誓者互相知晓身份，是彼此唯一的绝对信任</li>
                    <li>• <strong className="text-foreground">信任核心：</strong>可以互相验证身份，建立羔羊阵营的信任基础</li>
                    <li>• <strong className="text-teal-400">策略选择：</strong>早期公开身份建立信任，但会成为烙印者的猎杀目标</li>
                    <li>• <strong className="text-red-400">失去同伴：</strong>如果其中一人死亡，另一人失去唯一的绝对盟友</li>
                  </ul>
                </div>

                {/* Guard */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-900 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">设闩者 (The Bar-Setter)</h4>
                      <Badge className="bg-amber-600 text-xs">1人 · 守卫</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">夜晚能力：</strong>每晚可从外锁死一扇门，被守护者当晚不会被杀</li>
                    <li>• <strong className="text-foreground">守护限制：</strong>不能守护自己，不能连续两晚守护同一人</li>
                    <li>• <strong className="text-foreground">秘密行动：</strong>守护行为对所有人保密，只有设闩者自己知道</li>
                    <li>• <strong className="text-amber-400">生死责任：</strong>守对了有人活下来，守错了会有人死</li>
                    <li>• <strong className="text-red-400">无法自保：</strong>一旦被盯上且无法自保，必死无疑</li>
                  </ul>
                </div>

                {/* Innocent */}
                <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">无知者 (The Unknowing)</h4>
                      <Badge className="bg-blue-600 text-xs">6人 · 平民</Badge>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-13">
                    <li>• <strong className="text-foreground">真正羔羊：</strong>烙印是空白的，没有诅咒，也没有额外信息</li>
                    <li>• <strong className="text-foreground">依靠智慧：</strong>只有理智、观察和恐惧，还有献祭投票的权利</li>
                    <li>• <strong className="text-blue-400">阵营主力：</strong>无知者是羔羊阵营的主力，投票决定胜负</li>
                    <li>• <strong className="text-foreground">生存策略：</strong>仔细观察发言，找出伪装者，不要引起怀疑</li>
                    <li>• <strong className="text-red-400">脆弱存在：</strong>没有能力保护自己，随时可能成为猎物或被误献祭</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Game Flow */}
            <section className="border-t pt-4 pb-4">
              <h3 className="text-lg font-bold mb-3">游戏流程</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <strong className="text-foreground">夜晚阶段：</strong>
                    <span className="text-muted-foreground">聆心者查验 → 烙印者讨论并投票杀人 → 设闩者守护 → 食灰者被动验尸（如有献祭）</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <strong className="text-foreground">白天阶段：</strong>
                    <span className="text-muted-foreground">公布夜晚死者 → 所有存活玩家依次发言讨论 → 分析线索，寻找收割者</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <strong className="text-foreground">投票阶段：</strong>
                    <span className="text-muted-foreground">所有存活玩家投票献祭一人 → 得票最多者被推入白蜡篝火 → 平票则无人献祭</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <strong className="text-foreground">检查胜利：</strong>
                    <span className="text-muted-foreground">收割者 ≥ 羔羊，收割获胜 · 收割者全灭，羔羊获胜 · 否则进入下一夜晚</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

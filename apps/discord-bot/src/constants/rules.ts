export interface Rule {
  title: string
  description: string
}
export class Rules {
  public static ServerRules: Rule[] = [
    {
      title: "Follow Discord TOS and Guidelines",
      description: ""
    },
    {
      title: "Effective Organizing",
      description: " This server supports electoral efforts, develops strategies, and builds momentum. While critical discussion is welcome, we do not allow direct advocacy against electoral engagement or organizing. If you’re here, it’s because you believe change is possible."
    },
    {
      title: "Be Positive",
      description: "We aim to build a hopeful and constructive space. The goal is for others to be impressed by our discipline, clarity, and energy. Bring your best self."
    },
    {
      title: "Zero Tolerance for Fedposting",
      description: "We are a real political organization. Any mention, endorsement, joke, or casual acceptance of political violence is completely unacceptable. This isn’t r/funny, we all know who Luigi is, don’t try to dance around this rule."
    },
    {
      title: "Meme Responsibly",
      description: "You are welcome to push boundaries and be edgy, but know your audience. If what you say is more mean spirited than it is funny you can get pinged for this rule."
    },
    {
      title: "Cultural Common Sense",
      description: " Be mindful of how others will perceive your words, actions, or aesthetics. If your message could push an undecided voter toward a reactionary candidate, reconsider what you are about to say. We’re trying to win hearts and minds, not drive people away with self-sabotaging aesthetics."
    },
    {
      title: "Do Not Falsely or Poorly Represent the Org",
      description: "Do not claim to represent DGG Political Action without explicit permission. Whether online or at in-person events, avoid any behavior that could reflect poorly on DGG Political Action or Destiny if you are publicly associated with the group. Violating this rule may result in a ban."
    },
    {
      title: "Respect the Moderators",
      description:
        "* If you need assistance from a moderator, please request it by tagging <@&1385638258272108755>  or DMing <@575252669443211264> . Pinging the moderators for no reason (such as meme pinging or ghost pinging) will result in disciplinary actions.\n"+
        "* Harassing users for reporting rule-breaking is not allowed.\n"+
        "* No blocking Moderation. They may need to contact you related to the server.\n"+
        "* If you believe that a moderator has behaved inappropriately, please contact <@764253906736906271>. If you believe <@764253906736906271>  has behaved inappropriately, Contact <@623632405315452929> ."
    }
  ]
}
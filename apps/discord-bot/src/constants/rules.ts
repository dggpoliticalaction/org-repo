export interface Rule {
  title: string
  description: string
}
export class Rules {
  public static ServerRules: Rule[] = [
    {
      title: 'Follow Discord TOS and Guidelines',
      description: '',
    },
    {
      title: 'Stay Focused on Organizing',
      description:
        '* This server exists to support electoral work, strategy, and momentum. Critical discussion is fine, but direct advocacy against electoral engagement or organizing is not allowed. If you’re here, you believe change is possible.',
    },
    {
      title: 'Be Constructive and Positive',
      description:
        '* We aim to build a hopeful, constructive space. The goal is for others to be impressed by our discipline, clarity, and energy. Bring your best self.',
    },
    {
      title: 'No Fedposting or Advocacy of Violence',
      description:
        '* We are a real political organization. No endorsements, jokes, or casual acceptance of political violence. Do not make or encourage genuine threats or individual acts of violence or terrorism. This isn’t r/funny — we all know who Luigi is. Don’t dance around this rule.',
    },
    {
      title: 'Meme Responsibly; No Bigotry',
      description:
        '* Edgy humor is allowed if it’s genuinely funny and not mean-spirited. \n' + 
        '* Bigotry is not allowed. If your jokes drift into hateful territory, expect moderation. Explicit hateful or racist remarks will be punished harshly.',
    },
    {
      title: 'Maintain Constructive Political Aesthetics',
      description:
        '* Consider how your words and aesthetics land on undecided voters. Avoid messaging that could push people toward reactionary candidates. Don’t self-sabotage.',
    },
    {
      title: 'Do Not Falsely or Poorly Represent the Org',
      description:
        '* Do not claim to represent DGG Political Action without explicit permission. Whether online or in-person, avoid behavior that reflects poorly on DGG Political Action or Destiny if you are publicly associated with the group. Violations may result in a ban.',
    },
    {
      title: 'No Doxxing',
      description:
        '* Releasing personally identifiable information to create harassment or problems is an instant ban. Public political info (e.g., a congressman’s state) is fine; personal addresses or phone numbers are not. If it isn’t necessary to share PII, don’t.',
    },
    {
      title: 'No Sexual Comments About Women',
      description:
        '* These types of comments should be entirely avoided',
    },
    {
      title: 'Attack Arguments, Not Attributes',
      description:
        '* Focus on arguments, not personal traits. Low-effort insults (e.g., “fat lol,” “bald lol”) are not constructive and harm community culture.',
    },
    {
      title: 'No Organized Harassment or Unauthorized Mass Reporting',
      description:
        '* Do not coordinate demeaning behavior or attacks on individuals or groups. Engaging with other communities is fine; directing people to harass is not. Mass reporting or email campaigns are only allowed as part of an officially approved project.',
    },
    {
      title: 'No NSFW Posting',
      description:
        '* No pornographic or adult content. Newsworthy NSFW (e.g., war footage or gore in reporting contexts) is allowed when relevant.',
    },
    {
      title: 'Respect the Moderators',
      description:
        '* Use <@&1385638258272108755> or <@575252669443211264> for help.\n' + 
        '* No ghost-pinging, meme-pinging, blocking moderators\n' +
        '* Do not harass users for reporting issues.\n' + 
        '* If a moderator behaves inappropriately, contact <@764253906736906271> .\n' + 
        '* If the Head Moderator is the issue, contact <@623632405315452929> .\n',
    },
    {
      title: 'Follow Text Channel Rules',
      description:
        '* No spam, including intentionally loud audio.\n' + 
        '* Follow any channel-specific rules in pinned messages.',
    },
    {
      title: 'Follow Voice Channel Rules',
      description:
        '* No mic spam, screaming, or interrupting others.\n' + 
        '* No NSFW content.\n' + 
        '* Moderators have priority when moderation is required.\n' + 
        '* No voice changers or TTS unless approved.\n' + 
        '* Recording/streaming is prohibited except by the Events team when permission was granted in advance by speakers.',
    },
  ];  
};
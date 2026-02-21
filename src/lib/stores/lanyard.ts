import { useLanyard } from 'sveltekit-lanyard';

const USER_ID = '769702535124090904';

let instance: ReturnType<typeof useLanyard> | null = null;

export function getLanyard(): ReturnType<typeof useLanyard> {
	if (!instance) {
		instance = useLanyard({
			connectionType: 'ws',
			subscriptionScope: { subscribe_to_id: USER_ID }
		});
	}
	return instance;
}

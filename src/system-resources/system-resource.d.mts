interface SystemResourceApi<Descriptor, Info> {
	Query(descriptor: Descriptor): Promise<Info | null>;
	Delete?(info: Info): Promise<any>;
	Suspend?(info: Info): Promise<any>;
}
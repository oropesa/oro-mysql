const Ofn = require( 'oro-functions' );
const { OMysql } = require( '../index' );

//

const CONFIG_BAD = { host: 'chacho', database: 'chacho', user: 'chacho', password: 'loco' };
const CONFIG_BAD2 = { database: 'chacho', user: 'chacho', password: 'loco' };
const CONFIG = Ofn.getFileJsonRecursivelySync( `${__dirname}/config.json` );

//

describe('get OMysql defaults', () => {
    test( 'get client is mysql2', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        let client = oMysql.getClient();
        expect( Ofn.isObject( client ) ).toBe( true );

        let keys = Object.keys( client );
        expect( keys.includes( 'createConnection' ) ).toBe( true );
        expect( keys.includes( 'createPool' ) ).toBe( true );
    } );

    test( 'get db con', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        await oMysql.poolOpen();
        const db = oMysql.getDB();
        await oMysql.poolClose();

        expect( db.constructor.name ).toBe( 'PromiseConnection' );
    } );

    test( 'get default settings', async () => {
        const oMysql = new OMysql();

        expect( oMysql.getInfo() ).toEqual( { host: 'localhost', database: null, user: 'root', password: '' } );
    } );

    test( 'get info', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test', password: 'chacho' } );
        const oMysql = new OMysql( { settings } );

        expect( oMysql.getInfo() ).toEqual( { host: 'localhost', database: 'test', password: '******', user: 'root'} );
    } );

    test( 'get default status', async () => {
        const oMysql = new OMysql();

        expect( oMysql.status ).toBe( false );
        expect( oMysql.getStatus() ).toEqual( { status: false, error: { msg: 'Not connected yet.' } } );
    } );

    test( 'get status dis/connected', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        await oMysql.poolOpen();

        let status = oMysql.status;
        let objStatus = oMysql.getStatus();

        await oMysql.poolClose();

        expect( status ).toBe( true );
        expect( objStatus ).toEqual( { status: true, msg: 'Connected successfully.' } );

        expect( oMysql.status ).toBe( false );
        expect( oMysql.getStatus() ).toEqual( { status: false, error: { msg: 'Disconnected successfully.' } } );
    } );
});

describe('init Bad OMysql', () => {
    test( 'new OMysql( bad-config )', async () => {
        const oMysql = new OMysql( { settings: CONFIG_BAD } );

        const responseOpen = await oMysql.poolOpen();

        expect( responseOpen.status ).toBe( false );
        expect( responseOpen.error.msg ).toMatch( /(Error: getaddrinfo ENOTFOUND)/ );
    } );

    test( 'new OMysql( bad-config2 )', async () => {
        const oMysql = new OMysql( { settings: CONFIG_BAD2 } );

        const responseOpen = await oMysql.poolOpen();

        expect( responseOpen.status ).toBe( false );
        expect( responseOpen.error.msg ).toMatch( /(Error: Access denied for user)/ );
    } );

    test( 'new OMysql( timeout-config )', async () => {
        const customConfig = Object.assign( { connectTimeout: 1 }, CONFIG );
        const oMysql = new OMysql( { settings: customConfig } );

        const responseOpen = await oMysql.poolOpen();

        expect( responseOpen.status ).toBe( false );
        expect( responseOpen.error.msg ).toBe( `Error: connect ETIMEDOUT` );
    } );
});

describe('init OMysql', () => {
    test( 'new OMysql( config )', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        const responseOpen = await oMysql.poolOpen();
        const responseClose = await oMysql.poolClose();

        expect( responseOpen.status ).toBe( true );
        expect( responseOpen.msg ).toBe( 'Connected successfully.' );
        expect( responseClose.status ).toBe( true );
        expect( responseClose.msg ).toBe( 'Disconnected successfully.' );
    } );

    test( 'close without being opened', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        const responseClose = await oMysql.poolClose();

        expect( responseClose.status ).toBe( true );
        expect( responseClose.msg ).toBe( 'Is already disconnected.' );
    } );

    test( 'open one close twice', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        const responseOpen = await oMysql.poolOpen();
        const responseClose = await oMysql.poolClose();
        const responseClose2 = await oMysql.poolClose();

        expect( responseClose2.status ).toBe( true );
        expect( responseClose2.msg ).toBe( 'Is already disconnected.' );
    } );

    test( 'open twice', async () => {
        const oMysql = new OMysql( { settings: CONFIG } );

        const responseOpen = await oMysql.poolOpen();
        const responseOpen2 = await oMysql.poolOpen();
        const responseClose = await oMysql.poolClose();

        expect( responseOpen2.status ).toBe( true );
        expect( responseOpen2.msg ).toBe( 'Connected successfully.' );
    } );
});